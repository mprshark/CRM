-- schema.sql
-- HigenLabs CRM Database Schema & Policies
-- To be executed in Supabase SQL Editor

-- 1. Tables
CREATE TABLE campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  manager_id uuid, -- Reference added later to avoid circular dependency
  created_at timestamptz DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('ambassador', 'manager', 'admin', 'super_admin')),
  campus_id uuid REFERENCES campuses(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- Now we can add manager_id reference to campuses
ALTER TABLE campuses ADD CONSTRAINT campuses_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url text,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE student_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  ca_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  year text,
  course text,
  interest text,
  dedupe_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (dedupe_hash, ca_id)
);

CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  date date NOT NULL,
  count integer NOT NULL DEFAULT 1,
  proof_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE score_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL CHECK (subject_type IN ('ambassador', 'student')),
  subject_id uuid NOT NULL,
  delta numeric NOT NULL,
  reason text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity text NOT NULL,
  before jsonb,
  after jsonb,
  timestamp timestamptz DEFAULT now()
);

-- 2. Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

-- Helper function to get current user's campus
CREATE OR REPLACE FUNCTION get_my_campus()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT campus_id FROM users WHERE id = auth.uid();
$$;


-- Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Managers can view users in their campus" ON users FOR SELECT USING (
  get_my_role() = 'manager' AND campus_id = get_my_campus()
);
CREATE POLICY "Admins and super admins can view all users" ON users FOR SELECT USING (
  get_my_role() IN ('admin', 'super_admin')
);
-- Admins/Super Admins can insert/update users
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (
  get_my_role() IN ('admin', 'super_admin')
);
CREATE POLICY "Admins can update users" ON users FOR UPDATE USING (
  get_my_role() IN ('admin', 'super_admin')
);

-- Policies for campuses table
CREATE POLICY "Everyone can view campuses" ON campuses FOR SELECT USING (true);
CREATE POLICY "Admins can modify campuses" ON campuses FOR ALL USING (
  get_my_role() IN ('admin', 'super_admin')
);

-- Policies for uploads table
CREATE POLICY "Ambassadors can view their own uploads" ON uploads FOR SELECT USING (ca_id = auth.uid());
CREATE POLICY "Ambassadors can insert their own uploads" ON uploads FOR INSERT WITH CHECK (ca_id = auth.uid());
CREATE POLICY "Managers can view and update uploads in their campus" ON uploads FOR ALL USING (
  get_my_role() IN ('manager', 'admin', 'super_admin') -- Simplified for MVP: managers see all or could be restricted by campus via a join
);

-- Policies for student_records table
CREATE POLICY "Ambassadors can view their own student records" ON student_records FOR SELECT USING (ca_id = auth.uid());
CREATE POLICY "Ambassadors can insert student records" ON student_records FOR INSERT WITH CHECK (ca_id = auth.uid());
CREATE POLICY "Managers and Admins can view all student records" ON student_records FOR SELECT USING (
  get_my_role() IN ('manager', 'admin', 'super_admin')
);

-- Policies for activities table
CREATE POLICY "Ambassadors can view and insert their own activities" ON activities FOR SELECT USING (ca_id = auth.uid());
CREATE POLICY "Ambassadors can insert activities" ON activities FOR INSERT WITH CHECK (ca_id = auth.uid());
CREATE POLICY "Managers and Admins can view and update activities" ON activities FOR ALL USING (
  get_my_role() IN ('manager', 'admin', 'super_admin')
);

-- Policies for score_adjustments
CREATE POLICY "Anyone can view score adjustments" ON score_adjustments FOR SELECT USING (true);
CREATE POLICY "Only managers, admins, super admins can insert adjustments" ON score_adjustments FOR INSERT WITH CHECK (
  get_my_role() IN ('manager', 'admin', 'super_admin')
);

-- Policies for audit_log
CREATE POLICY "Super admins can view audit log" ON audit_log FOR SELECT USING (
  get_my_role() = 'super_admin'
);
-- All authenticated users can insert into audit log (via their actions)
CREATE POLICY "Anyone can insert audit logs" ON audit_log FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);


-- 3. Leaderboard RPC functions
-- Ambassador Leaderboard View
CREATE OR REPLACE FUNCTION get_ambassador_leaderboard()
RETURNS TABLE (
  id uuid,
  name text,
  campus text,
  total_points bigint,
  student_count bigint,
  adjustment_delta numeric
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    u.id, 
    u.name, 
    c.name as campus,
    (
      -- Sum of verified activities (mock point weights: event 20, workshop 30, etc.)
      COALESCE((SELECT sum(
        CASE type 
          WHEN 'event' THEN count * 20
          WHEN 'workshop' THEN count * 30
          WHEN 'social_post' THEN count * 5
          WHEN 'referral' THEN count * 10
          WHEN 'reached_student' THEN count * 1
          ELSE 0
        END
      ) FROM activities WHERE ca_id = u.id AND status = 'verified'), 0)
      +
      -- Sum of verified outreach points (1 point per student row in a verified upload)
      COALESCE((SELECT sum(row_count) FROM uploads WHERE ca_id = u.id AND status = 'verified'), 0)
      +
      -- Sum of adjustments
      COALESCE((SELECT sum(delta) FROM score_adjustments WHERE subject_type = 'ambassador' AND subject_id = u.id), 0)
    ) as total_points,
    -- Total students reached
    COALESCE((SELECT sum(row_count) FROM uploads WHERE ca_id = u.id AND status = 'verified'), 0) as student_count,
    -- Just the adjustment delta
    COALESCE((SELECT sum(delta) FROM score_adjustments WHERE subject_type = 'ambassador' AND subject_id = u.id), 0) as adjustment_delta
  FROM users u
  LEFT JOIN campuses c ON u.campus_id = c.id
  WHERE u.role = 'ambassador' AND u.status = 'active'
  ORDER BY total_points DESC, u.name ASC;
$$;

-- Student Leaderboard View
CREATE OR REPLACE FUNCTION get_student_leaderboard()
RETURNS TABLE (
  id text, -- using email as id for student board
  name text,
  total_points numeric,
  adjustment_delta numeric
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    email as id,
    MAX(name) as name,
    -- Points from adjustments (since students don't have activities natively in MVP, their points might only be adjustments or referrals)
    COALESCE((SELECT sum(delta) FROM score_adjustments WHERE subject_type = 'student' AND subject_id::text = email), 0) as total_points,
    COALESCE((SELECT sum(delta) FROM score_adjustments WHERE subject_type = 'student' AND subject_id::text = email), 0) as adjustment_delta
  FROM student_records
  GROUP BY email
  ORDER BY total_points DESC, name ASC;
$$;

-- Ambassador Rank Helper
CREATE OR REPLACE FUNCTION get_ambassador_rank(ca_id uuid)
RETURNS TABLE (rank bigint) LANGUAGE sql SECURITY DEFINER AS $$
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER(ORDER BY total_points DESC) as r
    FROM get_ambassador_leaderboard()
  )
  SELECT r as rank FROM ranked WHERE id = ca_id;
$$;
