// Seed script: creates one test user per role
// Run with: node seed_users.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL        = 'https://forxosuabfvmqeftkdqf.supabase.co'
const SERVICE_ROLE_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcnhvc3VhYmZ2bXFlZnRrZHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ1ODQ4MSwiZXhwIjoyMDk3MDM0NDgxfQ.RFjAnk89ZMlOZKVm36oGNiDWaq7QlluJ0Qnoa8lhhtY'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const USERS = [
  { email: 'ambassador@test.com', password: 'Test@1234', name: 'Test Ambassador', role: 'ambassador' },
  { email: 'manager@test.com',    password: 'Test@1234', name: 'Test Manager',    role: 'manager'    },
  { email: 'admin@test.com',      password: 'Test@1234', name: 'Test Admin',      role: 'admin'      },
]

for (const u of USERS) {
  // 1. Check if auth user already exists (try sign in)
  console.log(`\nProcessing ${u.email}...`)

  // Create auth user
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
  })

  let uid
  if (createErr) {
    if (createErr.message.includes('already been registered')) {
      // fetch existing user
      const { data: existing } = await admin.auth.admin.listUsers()
      const found = existing.users.find(x => x.email === u.email)
      if (found) {
        uid = found.id
        // Reset password to make sure
        await admin.auth.admin.updateUserById(uid, { password: u.password })
        console.log(`  ↻ Already exists — password reset to ${u.password}`)
      }
    } else {
      console.error(`  ✗ Auth error: ${createErr.message}`)
      continue
    }
  } else {
    uid = created.user.id
    console.log(`  ✓ Auth user created (${uid})`)
  }

  if (!uid) continue

  // 2. Upsert public profile
  const { error: dbErr } = await admin.from('users').upsert({
    id: uid,
    name: u.name,
    email: u.email,
    role: u.role,
    campus_id: null,
    status: 'active',
  }, { onConflict: 'id' })

  if (dbErr) {
    console.error(`  ✗ DB error: ${dbErr.message}`)
  } else {
    console.log(`  ✓ Profile upserted (role=${u.role})`)
  }
}

console.log(`
╔══════════════════════════════════════════╗
║          TEST CREDENTIALS                ║
╠══════════════════════════════════════════╣
║  SUPER ADMIN                             ║
║  Email:    superadmin@higenlabs.in       ║
║  Password: (existing — not changed)      ║
╠══════════════════════════════════════════╣
║  ADMIN                                   ║
║  Email:    admin@test.com                ║
║  Password: Test@1234                     ║
╠══════════════════════════════════════════╣
║  MANAGER                                 ║
║  Email:    manager@test.com              ║
║  Password: Test@1234                     ║
╠══════════════════════════════════════════╣
║  AMBASSADOR                              ║
║  Email:    ambassador@test.com           ║
║  Password: Test@1234                     ║
╚══════════════════════════════════════════╝
`)
