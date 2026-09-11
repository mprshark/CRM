# Superadmin User Management

Add a comprehensive user management system for superadmins, including the creation of a default superadmin account and an interface to manage user credentials.

## User Review Required

> [!CAUTION]
> **Important Security Limitation: Viewing Passwords**
> 
> You requested that the superadmin be able to "see their password". **This is mathematically impossible in Supabase (and any secure modern system).** Supabase hashes passwords using bcrypt, meaning the original password is never stored in the database, only an encrypted hash. 
> 
> **Proposed Solution:** While the superadmin *cannot* see the existing password, I will build a **Reset Password** feature. This allows the superadmin to type a new password (or auto-generate one) and force a password reset for that user. This achieves the goal of total control without compromising basic system security. Please confirm if this approach is acceptable.

## Proposed Changes

### 1. Database / Auth Seeding
- I will run a script against your Supabase project to create the requested superadmin account:
  - **Email**: `superadmin@higenlabs.in`
  - **Password**: `superhigen666`
  - **Role**: `super_admin`

### 2. User Management Interface

#### [NEW] `src/app/(dashboard)/admin/users/[id]/page.tsx`
- A new page for superadmins to view and manage a specific user's details.
- Forms to update the user's `name` and `email`.
- A dedicated "Reset Password" form allowing the superadmin to set a new, known password for the user.

#### [NEW] `src/app/actions/users.ts`
- Implement secure server actions utilizing `@supabase/supabase-js` (with a `service_role` key) to:
  - Update user emails in `auth.users`
  - Update user names in the public `users` table
  - Force reset passwords in `auth.users`
  - Ensure only users with the `super_admin` role can execute these actions.

## Verification Plan

### Manual Verification
1. Log in to the `/admin` portal using `superadmin@higenlabs.in` / `superhigen666`.
2. Navigate to the Users page.
3. Click to edit an existing Admin or Ambassador.
4. Update their email and name, verifying the changes save correctly.
5. Use the "Reset Password" tool to set a new password, then log out and verify the user can log in with that new password.
