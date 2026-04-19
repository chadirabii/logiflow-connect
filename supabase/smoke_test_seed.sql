-- LogiFlow Connect - Smoke test seed
-- Run in Supabase SQL Editor after setup.sql
-- It inserts realistic test records into all core app tables.

begin;

do $$
declare
  v_admin_id uuid;
  v_manager_id uuid;
  v_client_id uuid;

  v_booking_id text := 'bk-test-' || substr(gen_random_uuid()::text, 1, 8);
  v_shipment_id text := 'sh-test-' || substr(gen_random_uuid()::text, 1, 8);
  v_tracking_id text := 'te-test-' || substr(gen_random_uuid()::text, 1, 8);
  v_document_id text := 'doc-test-' || substr(gen_random_uuid()::text, 1, 8);
  v_conversation_id text := 'conv-test-' || substr(gen_random_uuid()::text, 1, 8);
  v_message_id text := 'msg-test-' || substr(gen_random_uuid()::text, 1, 8);
  v_reclamation_id text := 'rec-test-' || substr(gen_random_uuid()::text, 1, 8);
  v_notification_id text := 'notif-test-' || substr(gen_random_uuid()::text, 1, 8);
begin
  -- 1) Resolve required users in auth.users
  select id into v_admin_id
  from auth.users
  where lower(email) = lower('admin@247logistics.com')
  limit 1;

  select id into v_manager_id
  from auth.users
  where lower(email) = lower('manager@247logistics.com')
  limit 1;

  select id into v_client_id
  from auth.users
  where lower(email) = lower('client@247logistics.com')
  limit 1;

  if v_admin_id is null then
    raise exception 'Missing auth user: admin@247logistics.com. Create it in Authentication -> Users first.';
  end if;

  if v_manager_id is null then
    raise exception 'Missing auth user: manager@247logistics.com. Create it in Authentication -> Users first.';
  end if;

  if v_client_id is null then
    raise exception 'Missing auth user: client@247logistics.com. Create it in Authentication -> Users first.';
  end if;

  -- 2) Ensure role assignments
  insert into public.user_roles (user_id, role)
  values
    (v_admin_id, 'admin'::public.app_role),
    (v_manager_id, 'manager'::public.app_role),
    (v_client_id, 'client'::public.app_role)
  on conflict (user_id) do update set role = excluded.role;

  -- 3) Ensure profiles exist
  insert into public.profiles (user_id, full_name, company, phone)
  values
    (v_admin_id, 'Admin Test', '24/7 Logistics', '+21670000001'),
    (v_manager_id, 'Manager Test', '24/7 Logistics', '+21670000002'),
    (v_client_id, 'Client Test', 'Client Test Company', '+21670000003')
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    company = excluded.company,
    phone = excluded.phone,
    updated_at = now();

  -- 4) Booking
  insert into public.bookings (
    id, client_id, reference_number, full_name, company, email, phone,
    origin_country, origin_port, destination_country, destination_port,
    cargo_type, weight, volume, container_type, shipment_mode, incoterm,
    requested_date, special_instructions, status
  )
  values (
    v_booking_id,
    v_client_id,
    'BK-TEST-' || upper(substr(gen_random_uuid()::text, 1, 6)),
    'Client Test',
    'Client Test Company',
    'client@247logistics.com',
    '+21670000003',
    'Tunisie',
    'Port de Radès',
    'France',
    'Port de Marseille',
    'Produits de test',
    1200,
    8,
    '20GP',
    'FCL',
    'FOB',
    to_char(current_date + interval '7 day', 'YYYY-MM-DD'),
    'Seed smoke test booking',
    'submitted'::public.booking_status
  );

  -- 5) Shipment
  insert into public.shipments (
    id, booking_id, client_id, reference_number, status,
    current_location, current_port, estimated_arrival,
    origin_port, destination_port, vessel, container_number
  )
  values (
    v_shipment_id,
    v_booking_id,
    v_client_id,
    'SH-TEST-' || upper(substr(gen_random_uuid()::text, 1, 6)),
    'in_transit'::public.booking_status,
    'Mer Méditerranée',
    'En mer',
    to_char(current_date + interval '12 day', 'YYYY-MM-DD'),
    'Port de Radès',
    'Port de Marseille',
    'MV Smoke Test',
    'TESTCONT1234'
  );

  -- 6) Tracking event
  insert into public.tracking_events (
    id, shipment_id, status, location, port, description, timestamp
  )
  values (
    v_tracking_id,
    v_shipment_id,
    'in_transit'::public.booking_status,
    'Mer Méditerranée',
    'En mer',
    'Tracking seed event created',
    now()
  );

  -- 7) Document
  insert into public.documents (
    id, booking_id, shipment_id, client_id, name, type, size, uploaded_by, file_url
  )
  values (
    v_document_id,
    v_booking_id,
    v_shipment_id,
    v_client_id,
    'invoice-smoke-test.pdf',
    'invoice'::public.document_type,
    '128 KB',
    v_admin_id,
    'https://example.com/invoice-smoke-test.pdf'
  );

  -- 8) Conversation + message
  insert into public.conversations (
    id, client_id, last_message, last_message_at, unread_count
  )
  values (
    v_conversation_id,
    v_client_id,
    'Bonjour, votre dossier de test est créé.',
    now(),
    1
  );

  insert into public.messages (
    id, conversation_id, sender_id, content, read
  )
  values (
    v_message_id,
    v_conversation_id,
    v_admin_id,
    'Message seed de vérification.',
    false
  );

  -- 9) Reclamation
  insert into public.reclamations (
    id, client_id, booking_ref, subject, description, priority, status
  )
  values (
    v_reclamation_id,
    v_client_id,
    v_booking_id,
    'Réclamation de test',
    'Ceci est une réclamation seed de vérification.',
    'medium'::public.reclamation_priority,
    'open'::public.reclamation_status
  );

  -- 10) Notification
  insert into public.notifications (
    id, user_id, type, title, description, read, icon, action_url
  )
  values (
    v_notification_id,
    v_client_id,
    'info'::public.notification_type,
    'Seed test prêt',
    'Les données de test ont été insérées avec succès.',
    false,
    'info',
    '/client'
  );

  raise notice 'Seed completed. booking=% shipment=% conversation=%', v_booking_id, v_shipment_id, v_conversation_id;
end $$;

commit;

-- Quick verification output
select 'auth_users' as metric, count(*)::text as value from auth.users
union all
select 'profiles', count(*)::text from public.profiles
union all
select 'user_roles', count(*)::text from public.user_roles
union all
select 'bookings', count(*)::text from public.bookings
union all
select 'shipments', count(*)::text from public.shipments
union all
select 'tracking_events', count(*)::text from public.tracking_events
union all
select 'documents', count(*)::text from public.documents
union all
select 'conversations', count(*)::text from public.conversations
union all
select 'messages', count(*)::text from public.messages
union all
select 'reclamations', count(*)::text from public.reclamations
union all
select 'notifications', count(*)::text from public.notifications;
