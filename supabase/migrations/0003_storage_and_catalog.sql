-- ============================================================================
--  ROOMIE — Migration 0003 · Storage + Products fields for catalog
--  ----------------------------------------------------------------------------
--  Adds the columns the products table is missing for the catalog UI, creates
--  the four storage buckets used by the app and wires their RLS policies so
--  every upload is scoped by salon_id (or user_id for private uploads).
--
--  Run after 0002_create_my_salon.sql.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Products: add category + recommended_for
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists category text;

alter table public.products
  add column if not exists recommended_for text[] not null default '{}';

create index if not exists products_category_idx on public.products (salon_id, category);


-- ---------------------------------------------------------------------------
-- 2. Storage buckets
-- ---------------------------------------------------------------------------
-- Public read buckets (CDN-served): salon-logos, service-images, product-images
-- Private bucket (signed URLs only): client-uploads (selfies for Roomie Vision)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('salon-logos',    'salon-logos',    true,  5242880,  array['image/png','image/jpeg','image/webp']),
  ('service-images', 'service-images', true,  5242880,  array['image/png','image/jpeg','image/webp']),
  ('product-images', 'product-images', true,  5242880,  array['image/png','image/jpeg','image/webp']),
  ('client-uploads', 'client-uploads', false, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ---------------------------------------------------------------------------
-- 3. Storage RLS policies
--
-- Path convention:
--   salon-* buckets   → {salon_id}/<filename>
--   client-uploads    → {user_id}/<filename>
--
-- storage.foldername(name) returns text[] — we read the first segment
-- and cast/match against the caller's salon_id or auth.uid().
-- ---------------------------------------------------------------------------

-- ---- salon-logos ----------------------------------------------------------
drop policy if exists "salon_logos_public_read"   on storage.objects;
drop policy if exists "salon_logos_owner_write"   on storage.objects;
drop policy if exists "salon_logos_owner_update"  on storage.objects;
drop policy if exists "salon_logos_owner_delete"  on storage.objects;

create policy "salon_logos_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'salon-logos');

create policy "salon_logos_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'salon-logos'
    and (
      public.is_admin()
      or (
        public.current_role() = 'salon_owner'
        and (storage.foldername(name))[1] = public.current_salon_id()::text
      )
    )
  );

create policy "salon_logos_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'salon-logos'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  )
  with check (
    bucket_id = 'salon-logos'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  );

create policy "salon_logos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'salon-logos'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  );


-- ---- service-images -------------------------------------------------------
drop policy if exists "service_images_public_read"  on storage.objects;
drop policy if exists "service_images_owner_write"  on storage.objects;
drop policy if exists "service_images_owner_update" on storage.objects;
drop policy if exists "service_images_owner_delete" on storage.objects;

create policy "service_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'service-images');

create policy "service_images_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'service-images'
    and (
      public.is_admin()
      or (
        public.current_role() = 'salon_owner'
        and (storage.foldername(name))[1] = public.current_salon_id()::text
      )
    )
  );

create policy "service_images_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'service-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  )
  with check (
    bucket_id = 'service-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  );

create policy "service_images_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'service-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  );


-- ---- product-images -------------------------------------------------------
drop policy if exists "product_images_public_read"  on storage.objects;
drop policy if exists "product_images_owner_write"  on storage.objects;
drop policy if exists "product_images_owner_update" on storage.objects;
drop policy if exists "product_images_owner_delete" on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product_images_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (
      public.is_admin()
      or (
        public.current_role() = 'salon_owner'
        and (storage.foldername(name))[1] = public.current_salon_id()::text
      )
    )
  );

create policy "product_images_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  )
  with check (
    bucket_id = 'product-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  );

create policy "product_images_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_salon_id()::text
    )
  );


-- ---- client-uploads  (private — selfies for Roomie Vision) ----------------
drop policy if exists "client_uploads_owner_read"   on storage.objects;
drop policy if exists "client_uploads_owner_write"  on storage.objects;
drop policy if exists "client_uploads_owner_update" on storage.objects;
drop policy if exists "client_uploads_owner_delete" on storage.objects;

create policy "client_uploads_owner_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'client-uploads'
    and (
      public.is_admin()
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

create policy "client_uploads_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'client-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "client_uploads_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'client-uploads'
    and (
      public.is_admin()
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id = 'client-uploads'
    and (
      public.is_admin()
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

create policy "client_uploads_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'client-uploads'
    and (
      public.is_admin()
      or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

commit;
