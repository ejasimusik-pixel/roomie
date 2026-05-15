-- ============================================================================
--  ROOMIE — Migration 0002 · create_my_salon RPC
--  ----------------------------------------------------------------------------
--  Lets a `salon_owner` who has NOT yet been assigned to a salon create their
--  own salon + auto-attach themselves to it in a single transaction.
--  Implemented as SECURITY DEFINER so it can bypass the salons_insert_admin
--  policy while still enforcing role/state checks inside the function body.
--
--  Run after 0001_initial.sql.
-- ============================================================================

begin;

create or replace function public.create_my_salon(
  p_name               text,
  p_slug               text,
  p_primary_color      text default '#E040A0',
  p_secondary_color    text default '#7C52AA',
  p_logo_url           text default null,
  p_whatsapp_number    text default null,
  p_roomie_personality jsonb default '{}'::jsonb
)
returns public.salons
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id   uuid := auth.uid();
  caller_row  public.profiles%rowtype;
  new_salon   public.salons%rowtype;
  clean_slug  text;
begin
  if caller_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select * into caller_row from public.profiles where id = caller_id;
  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if caller_row.role <> 'salon_owner' then
    raise exception 'ONLY_SALON_OWNER_CAN_CREATE_SALON' using errcode = '42501';
  end if;

  if caller_row.salon_id is not null then
    raise exception 'OWNER_ALREADY_HAS_SALON' using errcode = '23505';
  end if;

  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'NAME_REQUIRED' using errcode = '22023';
  end if;

  clean_slug := lower(regexp_replace(coalesce(p_slug, p_name), '[^a-z0-9]+', '-', 'gi'));
  clean_slug := btrim(clean_slug, '-');
  if length(clean_slug) < 3 then
    raise exception 'SLUG_TOO_SHORT' using errcode = '22023';
  end if;

  insert into public.salons (
    name, slug, primary_color, secondary_color,
    logo_url, whatsapp_number, roomie_personality
  )
  values (
    btrim(p_name),
    clean_slug,
    coalesce(p_primary_color, '#E040A0'),
    coalesce(p_secondary_color, '#7C52AA'),
    p_logo_url,
    p_whatsapp_number,
    coalesce(p_roomie_personality, '{}'::jsonb)
  )
  returning * into new_salon;

  update public.profiles
     set salon_id = new_salon.id
   where id = caller_id;

  return new_salon;
end;
$$;

-- The function checks role itself, but we still restrict who can call it.
revoke all on function public.create_my_salon(text,text,text,text,text,text,jsonb) from public, anon;
grant execute on function public.create_my_salon(text,text,text,text,text,text,jsonb) to authenticated;

commit;
