# ROOMIE — Supabase migrations

This folder holds the SQL migrations for the ROOMIE database, designed to be
**executed manually** in the Supabase Dashboard → SQL Editor.

## How to apply the initial schema

1. Open your project at <https://app.supabase.com/project/_/sql/new>.
2. Copy the contents of `migrations/0001_initial.sql` into the editor.
3. Click **Run**. The script wraps everything in a single transaction; if any
   statement fails, nothing is committed.
4. After the script succeeds, verify in **Database → Tables** that the eight
   tables exist:

   - `salons`
   - `profiles`
   - `services`
   - `products`
   - `appointments`
   - `client_profiles`
   - `hair_profiles`
   - `onboarding_answers`

5. In **Database → Triggers**, confirm `on_auth_user_created` is wired to the
   `auth.users` table.
6. In **Authentication → URL Configuration**, add your app's callback URL
   (`https://YOUR-DOMAIN/auth/callback`) to the redirect allow list.

## What the migration does

- Creates all eight tenant-scoped tables (each carries `salon_id`, `created_at`
  and `updated_at`, except `salons` itself and `profiles` where `salon_id` is
  intentionally nullable).
- Enables Row Level Security on every table from day one.
- Adds RLS policies for `client`, `salon_owner` and `admin` roles using two
  `security definer` helpers (`current_role()`, `current_salon_id()`) so policies
  stay short and avoid recursion.
- Installs an `on_auth_user_created` trigger that automatically inserts a
  matching `profiles` row whenever a user signs up — reading `role`, `salon_id`
  and `full_name` from the `raw_user_meta_data` sent by the frontend.
- Installs a shared `set_updated_at()` trigger on every table so the timestamp
  is always accurate.
- Adds the indexes you'll need most: `salon_id`, `slug`, `is_active`,
  `(salon_id, starts_at)` for appointments, etc.

## Promoting the first admin

The trigger defaults every new user to `client`. To turn one into an admin
after they sign up, run in the SQL Editor:

```sql
update public.profiles
   set role = 'admin'
 where email = 'your-email@example.com';
```

## What's NOT in this migration (intentional)

- AI tables / vector embeddings.
- Payments / subscriptions.
- Promo codes.
- Analytics rollups.

Those will arrive in dedicated migrations (`0002_*.sql`, …) once their features
are scheduled.
