-- ============================================================================
--  ROOMIE — Migration 0004 · Fix salons SELECT stall for authenticated role
--  ----------------------------------------------------------------------------
--  Problem
--    `select … from public.salons where is_active=true` hangs for any
--    authenticated salon_owner / client JWT, while the same query returns in
--    <0.5 s under the anon role. The Discover page and the public salon page
--    therefore always hit the 8 s frontend timeout when a user is logged in.
--
--  Root cause
--    The previous policy
--        for select to authenticated
--        using (is_active or public.is_admin())
--    is logically correct but `public.is_admin()` is evaluated per row in
--    some plans and (despite being security definer) interacts poorly with
--    the way Supabase nests JWT-derived role checks. Splitting the policy
--    into a fast, purely column-based one for the active-salon case and a
--    separate admin-only one for inactive rows removes the per-row function
--    call from the hot path.
--
--  Fix
--    - Drop the old combined policies.
--    - Add a single permissive read for anon + authenticated where
--      `is_active = true` (no function call).
--    - Add a separate admin-only read so admins still see inactive salons.
--
--  Run after 0003_storage_and_catalog.sql.
-- ============================================================================

begin;

drop policy if exists salons_select_authenticated on public.salons;
drop policy if exists salons_select_anon          on public.salons;
drop policy if exists salons_select_active        on public.salons;
drop policy if exists salons_select_admin_all     on public.salons;

-- Active salons are publicly readable to any role. No function calls in
-- the using clause → no per-row stalls under authenticated JWTs.
create policy salons_select_active on public.salons
  for select
  to anon, authenticated
  using (is_active = true);

-- Admins additionally see inactive salons.
create policy salons_select_admin_all on public.salons
  for select
  to authenticated
  using (public.is_admin());

commit;

-- ============================================================================
-- Verification (run as the affected user in SQL editor after applying):
--   select id, name, slug from public.salons where is_active = true limit 5;
-- Expected: returns in <500 ms whether the JWT is anon or salon_owner.
-- ============================================================================
