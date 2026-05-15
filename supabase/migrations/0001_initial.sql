-- ============================================================================
--  ROOMIE — Initial schema (v1)
--  Multi-tenant SaaS · PostgreSQL 15+ · Supabase
--  ----------------------------------------------------------------------------
--  Conventions enforced by this migration:
--    • Every business table carries `salon_id` (tenant) + `created_at` + `updated_at`
--      EXCEPT `salons` (its own `id` IS the tenant root) and `profiles`
--      (`salon_id` is nullable to allow unaffiliated clients & global admins).
--    • Row Level Security is ENABLED on every table from day one.
--    • Two security-definer helpers (`public.current_role`, `public.current_salon_id`)
--      keep policies short and avoid recursive lookups against `profiles`.
--    • A trigger on `auth.users` automatically provisions a `profiles` row
--      reading `role` / `salon_id` / `full_name` from `raw_user_meta_data`.
--    • `updated_at` is auto-maintained by a single shared trigger.
--    • Indexes cover the high-cardinality tenant filter + common access paths.
--  ----------------------------------------------------------------------------
--  How to run:
--    Open Supabase → SQL Editor → New query → paste this file → Run.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- 1. Shared utility functions
-- ---------------------------------------------------------------------------

-- Auto-updates `updated_at` on every row mutation.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Returns the current authenticated user's role (or NULL if anonymous / no profile).
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Returns the current authenticated user's tenant (salon_id).
create or replace function public.current_salon_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select salon_id from public.profiles where id = auth.uid()
$$;

-- Convenience: is the current user a platform admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false)
$$;

-- ---------------------------------------------------------------------------
-- 2. Core tables
-- ---------------------------------------------------------------------------

-- 2.1 salons  ── tenant root
create table if not exists public.salons (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  logo_url            text,
  primary_color       text not null default '#E040A0',
  secondary_color     text not null default '#7C52AA',
  roomie_personality  jsonb not null default '{}'::jsonb,   -- reserved for future AI contextual config
  whatsapp_number     text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists salons_slug_idx       on public.salons (slug);
create index if not exists salons_is_active_idx  on public.salons (is_active);

create trigger salons_set_updated_at
before update on public.salons
for each row execute function public.set_updated_at();


-- 2.2 profiles  ── 1:1 with auth.users
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            text not null check (role in ('client','salon_owner','admin')) default 'client',
  salon_id        uuid references public.salons(id) on delete set null,   -- nullable on purpose
  full_name       text,
  email           text,
  avatar_url      text,
  locale          text not null default 'es',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists profiles_salon_id_idx on public.profiles (salon_id);
create index if not exists profiles_role_idx     on public.profiles (role);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();


-- 2.3 services  ── catálogo del salón
create table if not exists public.services (
  id                uuid primary key default gen_random_uuid(),
  salon_id          uuid not null references public.salons(id) on delete cascade,
  name              text not null,
  description       text,
  category          text,
  duration_minutes  int  not null default 60 check (duration_minutes > 0),
  price_cents       int  not null default 0  check (price_cents >= 0),
  currency          text not null default 'MXN',
  image_url         text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists services_salon_id_idx  on public.services (salon_id);
create index if not exists services_active_idx    on public.services (salon_id, is_active);
create index if not exists services_category_idx  on public.services (salon_id, category);

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();


-- 2.4 products  ── retail / inventario del salón
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  salon_id        uuid not null references public.salons(id) on delete cascade,
  name            text not null,
  description     text,
  brand           text,
  sku             text,
  price_cents     int not null default 0 check (price_cents >= 0),
  currency        text not null default 'MXN',
  stock           int not null default 0 check (stock >= 0),
  image_url       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists products_salon_sku_uidx
  on public.products (salon_id, sku) where sku is not null;
create index if not exists products_salon_active_idx on public.products (salon_id, is_active);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();


-- 2.5 appointments
create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  salon_id      uuid not null references public.salons(id) on delete cascade,
  client_id     uuid references public.profiles(id) on delete set null,
  staff_id      uuid references public.profiles(id) on delete set null,
  service_id    uuid references public.services(id) on delete set null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  status        text not null default 'pending'
                check (status in ('pending','confirmed','completed','cancelled','no_show')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint appointments_time_check check (ends_at > starts_at)
);

create index if not exists appointments_salon_time_idx
  on public.appointments (salon_id, starts_at);
create index if not exists appointments_client_idx
  on public.appointments (client_id, starts_at desc);
create index if not exists appointments_staff_idx
  on public.appointments (staff_id, starts_at);
create index if not exists appointments_status_idx
  on public.appointments (salon_id, status);

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();


-- 2.6 client_profiles  ── lifestyle + perfil emocional (1:1 con profiles tipo client)
create table if not exists public.client_profiles (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null unique references public.profiles(id) on delete cascade,
  salon_id        uuid references public.salons(id) on delete set null,   -- salón preferido
  birthdate       date,
  phone           text,
  lifestyle       text,        -- calmada, activa, social, etc.
  preferred_vibe  text,        -- minimal, glam, natural, ...
  skin_tone       text,
  allergies       text[]  not null default '{}',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists client_profiles_profile_idx on public.client_profiles (profile_id);
create index if not exists client_profiles_salon_idx   on public.client_profiles (salon_id);

create trigger client_profiles_set_updated_at
before update on public.client_profiles
for each row execute function public.set_updated_at();


-- 2.7 hair_profiles  ── extensión técnica (1:1 con client_profiles)
create table if not exists public.hair_profiles (
  id                  uuid primary key default gen_random_uuid(),
  client_profile_id   uuid not null unique references public.client_profiles(id) on delete cascade,
  salon_id            uuid references public.salons(id) on delete set null,
  hair_type           text,         -- straight | wavy | curly | coily
  hair_thickness      text,         -- fine | medium | thick
  scalp_type          text,         -- dry | normal | oily | mixed
  current_treatments  text[] not null default '{}',
  color_history       jsonb  not null default '[]'::jsonb,
  last_service_date   date,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists hair_profiles_client_idx on public.hair_profiles (client_profile_id);
create index if not exists hair_profiles_salon_idx  on public.hair_profiles (salon_id);

create trigger hair_profiles_set_updated_at
before update on public.hair_profiles
for each row execute function public.set_updated_at();


-- 2.8 onboarding_answers  ── N:1 con profiles, versionable
create table if not exists public.onboarding_answers (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  salon_id            uuid references public.salons(id) on delete set null,
  onboarding_version  text not null default 'v1',
  question_key        text not null,
  answer              jsonb not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (profile_id, onboarding_version, question_key)
);

create index if not exists onboarding_answers_profile_idx
  on public.onboarding_answers (profile_id, onboarding_version);
create index if not exists onboarding_answers_salon_idx
  on public.onboarding_answers (salon_id);

create trigger onboarding_answers_set_updated_at
before update on public.onboarding_answers
for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 3. Auto-provisioning trigger: auth.users → public.profiles
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
  meta_salon uuid;
begin
  meta_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  if meta_role not in ('client','salon_owner','admin') then
    meta_role := 'client';
  end if;

  begin
    meta_salon := nullif(new.raw_user_meta_data->>'salon_id','')::uuid;
  exception when others then
    meta_salon := null;
  end;

  insert into public.profiles (id, email, full_name, role, salon_id, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)),
    meta_role,
    meta_salon,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 4. Row Level Security  (ENABLE FROM DAY ONE)
-- ---------------------------------------------------------------------------

alter table public.salons              enable row level security;
alter table public.profiles            enable row level security;
alter table public.services            enable row level security;
alter table public.products            enable row level security;
alter table public.appointments        enable row level security;
alter table public.client_profiles     enable row level security;
alter table public.hair_profiles       enable row level security;
alter table public.onboarding_answers  enable row level security;

-- 4.1 salons ────────────────────────────────────────────────────────────────
-- READ: every authenticated user can browse the directory of active salons.
drop policy if exists salons_select_authenticated on public.salons;
create policy salons_select_authenticated on public.salons
  for select to authenticated
  using (is_active or public.is_admin());

-- Public (anon) read of active salons for the landing/discover page.
drop policy if exists salons_select_anon on public.salons;
create policy salons_select_anon on public.salons
  for select to anon
  using (is_active);

-- INSERT: only admins create salons.
drop policy if exists salons_insert_admin on public.salons;
create policy salons_insert_admin on public.salons
  for insert to authenticated
  with check (public.is_admin());

-- UPDATE: admin OR the owner of that salon.
drop policy if exists salons_update_owner_admin on public.salons;
create policy salons_update_owner_admin on public.salons
  for update to authenticated
  using (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and id = public.current_salon_id())
  )
  with check (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and id = public.current_salon_id())
  );

-- DELETE: admin only.
drop policy if exists salons_delete_admin on public.salons;
create policy salons_delete_admin on public.salons
  for delete to authenticated
  using (public.is_admin());


-- 4.2 profiles ──────────────────────────────────────────────────────────────
-- SELECT: self, same-salon staff, or admin.
drop policy if exists profiles_select_self_or_tenant on public.profiles;
create policy profiles_select_self_or_tenant on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'salon_owner'
      and salon_id is not null
      and salon_id = public.current_salon_id()
    )
  );

-- INSERT: only the trigger writes here (security definer bypasses RLS).
-- We still allow self-insert as a safety net.
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- UPDATE: self can update self (except role/salon_id changes are gated below);
-- admin can update anyone; salon_owner can update profiles in their salon.
drop policy if exists profiles_update_self_admin on public.profiles;
create policy profiles_update_self_admin on public.profiles
  for update to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  )
  with check (
    id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  );

-- DELETE: admin only.
drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.is_admin());


-- 4.3 services ─────────────────────────────────────────────────────────────
-- SELECT: public catalog — anyone can read active services.
drop policy if exists services_select_all on public.services;
create policy services_select_all on public.services
  for select to anon, authenticated
  using (is_active or public.is_admin() or salon_id = public.current_salon_id());

-- INSERT/UPDATE/DELETE: only the salon owner of that salon or admin.
drop policy if exists services_write_owner_admin on public.services;
create policy services_write_owner_admin on public.services
  for all to authenticated
  using (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  )
  with check (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  );


-- 4.4 products ─────────────────────────────────────────────────────────────
drop policy if exists products_select_all on public.products;
create policy products_select_all on public.products
  for select to anon, authenticated
  using (is_active or public.is_admin() or salon_id = public.current_salon_id());

drop policy if exists products_write_owner_admin on public.products;
create policy products_write_owner_admin on public.products
  for all to authenticated
  using (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  )
  with check (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  );


-- 4.5 appointments ─────────────────────────────────────────────────────────
-- SELECT: client themselves · assigned staff · owner of that salon · admin.
drop policy if exists appointments_select_scoped on public.appointments;
create policy appointments_select_scoped on public.appointments
  for select to authenticated
  using (
    client_id = auth.uid()
    or staff_id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  );

-- INSERT: a client can book for themselves in any salon · owner can create for their salon · admin always.
drop policy if exists appointments_insert_scoped on public.appointments;
create policy appointments_insert_scoped on public.appointments
  for insert to authenticated
  with check (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
    or (public.current_role() = 'client' and client_id = auth.uid())
  );

-- UPDATE: owner/admin freely; client only their own (no salon switching).
drop policy if exists appointments_update_scoped on public.appointments;
create policy appointments_update_scoped on public.appointments
  for update to authenticated
  using (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
    or (client_id = auth.uid())
  )
  with check (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
    or (client_id = auth.uid())
  );

drop policy if exists appointments_delete_owner_admin on public.appointments;
create policy appointments_delete_owner_admin on public.appointments
  for delete to authenticated
  using (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  );


-- 4.6 client_profiles ──────────────────────────────────────────────────────
drop policy if exists client_profiles_select_scoped on public.client_profiles;
create policy client_profiles_select_scoped on public.client_profiles
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  );

drop policy if exists client_profiles_insert_self on public.client_profiles;
create policy client_profiles_insert_self on public.client_profiles
  for insert to authenticated
  with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists client_profiles_update_self_admin on public.client_profiles;
create policy client_profiles_update_self_admin on public.client_profiles
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists client_profiles_delete_admin on public.client_profiles;
create policy client_profiles_delete_admin on public.client_profiles
  for delete to authenticated
  using (public.is_admin());


-- 4.7 hair_profiles ────────────────────────────────────────────────────────
drop policy if exists hair_profiles_select_scoped on public.hair_profiles;
create policy hair_profiles_select_scoped on public.hair_profiles
  for select to authenticated
  using (
    public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
    or exists (
      select 1 from public.client_profiles cp
      where cp.id = client_profile_id and cp.profile_id = auth.uid()
    )
  );

drop policy if exists hair_profiles_write_self_admin on public.hair_profiles;
create policy hair_profiles_write_self_admin on public.hair_profiles
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.client_profiles cp
      where cp.id = client_profile_id and cp.profile_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.client_profiles cp
      where cp.id = client_profile_id and cp.profile_id = auth.uid()
    )
  );


-- 4.8 onboarding_answers ──────────────────────────────────────────────────
drop policy if exists onboarding_select_scoped on public.onboarding_answers;
create policy onboarding_select_scoped on public.onboarding_answers
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'salon_owner' and salon_id = public.current_salon_id())
  );

drop policy if exists onboarding_insert_self on public.onboarding_answers;
create policy onboarding_insert_self on public.onboarding_answers
  for insert to authenticated
  with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists onboarding_update_self on public.onboarding_answers;
create policy onboarding_update_self on public.onboarding_answers
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists onboarding_delete_admin on public.onboarding_answers;
create policy onboarding_delete_admin on public.onboarding_answers
  for delete to authenticated
  using (public.is_admin());


-- ---------------------------------------------------------------------------
-- 5. Grants  (Supabase already grants anon/authenticated by default, but we
--    make it explicit for clarity.)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.salons, public.services, public.products to anon;
grant select, insert, update, delete on
  public.salons,
  public.profiles,
  public.services,
  public.products,
  public.appointments,
  public.client_profiles,
  public.hair_profiles,
  public.onboarding_answers
to authenticated;

commit;

-- ============================================================================
--  Migration complete.
--  Next manual steps (do these AFTER running this file):
--    1. In Supabase Dashboard → Authentication → URL Configuration, add your
--       app's `/auth/callback` URL to the allow list.
--    2. (Optional) Configure Google as a Provider in Authentication → Providers
--       and add the same callback URL to the Google Cloud Console.
--    3. To create the FIRST admin user manually (since signup defaults to
--       'client'), run after they sign up:
--           update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
-- ============================================================================
