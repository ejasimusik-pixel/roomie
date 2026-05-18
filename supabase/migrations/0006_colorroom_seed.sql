-- Migration 0006: Cinematic Seed Script for ColorRoom Demo
-- Features an RPC to automatically populate a given salon ID with premium dummy data

CREATE OR REPLACE FUNCTION public.seed_colorroom_data(p_salon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client1_id uuid := gen_random_uuid();
    v_client2_id uuid := gen_random_uuid();
    v_client3_id uuid := gen_random_uuid();
    v_service1_id uuid := gen_random_uuid();
    v_service2_id uuid := gen_random_uuid();
    v_service3_id uuid := gen_random_uuid();
    v_service4_id uuid := gen_random_uuid();
BEGIN
    -- 1. Clear current salon data safely
    DELETE FROM public.appointments WHERE salon_id = p_salon_id;
    DELETE FROM public.services WHERE salon_id = p_salon_id;
    DELETE FROM public.products WHERE salon_id = p_salon_id;
    
    -- 2. Mock some beautiful client users in Auth
    -- The trigger `on_auth_user_created` will auto-spawn their profiles.
    -- We use a gentle approach for Supabase schema safely.
    INSERT INTO auth.users (id, aud, role, email, encrypted_password, created_at, updated_at, raw_user_meta_data)
    VALUES 
        (v_client1_id, 'authenticated', 'authenticated', 'isabella@mock.roomie.app', '', now(), now(), '{"full_name": "Isabella Gómez", "role": "client"}'),
        (v_client2_id, 'authenticated', 'authenticated', 'martina@mock.roomie.app', '', now(), now(), '{"full_name": "Martina Osorio", "role": "client"}'),
        (v_client3_id, 'authenticated', 'authenticated', 'camila@mock.roomie.app', '', now(), now(), '{"full_name": "Camila Ruiz", "role": "client"}')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Premium Services
    INSERT INTO public.services (id, salon_id, name, description, category, duration_minutes, price_cents, currency, is_active, image_url)
    VALUES
        (v_service1_id, p_salon_id, 'Color Design Custom', 'Técnica de autor a mano alzada para lograr rubios exquisitos con dimensión natural. Incluye Olaplex y Gloss de brillo radiante.', 'Cabello', 240, 450000, 'MXN', true, 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800'),
        (v_service2_id, p_salon_id, 'Hair Bottox de Seda', 'Tratamiento sellador de cutícula de lujo que elimina la porosidad y aporta un brillo espectacular por 4 semanas.', 'Tratamiento', 90, 180000, 'MXN', true, 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'),
        (v_service3_id, p_salon_id, 'Manicura Rusa Spa', 'Elegante manicura en seco con alineación perfecta. Finalizado con crema de loto y aceites esenciales tibios.', 'Uñas', 75, 85000, 'MXN', true, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800'),
        (v_service4_id, p_salon_id, 'Gloss & Tone', 'Un baño de color exprés para revivir tu estilo entre retoques mayores. Ideal para matizar e iluminar.', 'Cabello', 45, 95000, 'MXN', true, 'https://images.unsplash.com/photo-1562916698-a28a1ea568a9?auto=format&fit=crop&q=80&w=800');

    -- 4. Insert Premium Products
    INSERT INTO public.products (salon_id, name, brand, description, category, price_cents, currency, recommended_for, is_active, image_url)
    VALUES
        (p_salon_id, 'No. 4 Bond Maintenance', 'Olaplex', 'Shampoo premium que repara profundamente la molécula del cabello, devolviendo la fuerza original post-decoloración.', 'Cabello', 145000, 'MXN', ARRAY['Color', 'Dañado', 'Seco'], true, 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800'),
        (p_salon_id, 'Elixir Ultime L''Huile', 'Kérastase', 'Aceite icónico iluminador que brinda un brillo sublime sin apelmazar el cabello. Fragancia de lujo.', 'Styling', 210000, 'MXN', ARRAY['Frizz', 'Brillo'], true, 'https://images.unsplash.com/photo-1556228720-192a6af4e86e?auto=format&fit=crop&q=80&w=800'),
        (p_salon_id, 'Sérum Hialurónico B5', 'SkinCeuticals', 'Boost de hidratación profunda ultra ligera. El secreto para un rostro jugoso antes del makeup.', 'Facial', 185000, 'MXN', ARRAY['Skincare', 'Textura'], true, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800');

    -- 5. Wait momentarily just in case trigger needs a microsecond before we use the profiles (pg is transactional but safe practice for external hooks)
    -- Insert Appointments simulating "live" schedule for Vicnnel
    INSERT INTO public.appointments (salon_id, client_id, service_id, starts_at, ends_at, status, notes)
    VALUES
        (p_salon_id, v_client1_id, v_service1_id, now() + interval '2 hours', now() + interval '6 hours', 'confirmed', 'Es clienta V.I.P. Ofrecer bebida de cortesía al llegar y enfocar en plática relajada.'),
        (p_salon_id, v_client2_id, v_service3_id, now() + interval '6 hours 30 mins', now() + interval '7 hours 45 mins', 'confirmed', 'Clienta nueva, agendó desde el link de tu perfil de Instagram.'),
        (p_salon_id, v_client3_id, v_service2_id, now() + interval '1 day 2 hours', now() + interval '1 day 3 hours 30 mins', 'pending', 'Viene para su preparación pre-boda. ¡Dejar el cabello increíble!');
END;
$$;

-- Comment describing the payload
COMMENT ON FUNCTION public.seed_colorroom_data IS 'Pobla la base de datos mágicamente con información VIP de lujo, citas vivas y clientas generadas';
