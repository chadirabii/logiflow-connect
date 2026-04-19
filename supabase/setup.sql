-- LogiFlow Connect - Supabase bootstrap (run in SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS, UPSERT patterns, and CREATE OR REPLACE

create extension if not exists pgcrypto;

-- =========================
-- Enums
-- =========================
do $$
begin
  create type public.app_role as enum ('admin', 'client', 'manager');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.booking_status as enum (
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'confirmed',
    'in_transit',
    'arrived_port',
    'customs',
    'delivering',
    'delivered'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.document_type as enum (
    'invoice',
    'packing_list',
    'customs',
    'transport',
    'contract',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_type as enum (
    'message',
    'status_update',
    'alert',
    'success',
    'info'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.reclamation_priority as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.reclamation_status as enum ('open', 'in_progress', 'resolved', 'closed');
exception
  when duplicate_object then null;
end $$;

-- =========================
-- Utility functions
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- Core tables
-- =========================
create table if not exists public.profiles (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  company text,
  phone text,
  rne_file text,
  patente_file text,
  avatar_url text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists last_seen_at timestamptz not null default now();

create table if not exists public.user_roles (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.app_role not null
);

create table if not exists public.bookings (
  id text primary key default gen_random_uuid()::text,
  client_id uuid not null references auth.users(id) on delete cascade,
  reference_number text not null,
  full_name text not null,
  company text,
  email text,
  phone text,
  origin_country text not null,
  origin_port text not null,
  destination_country text not null,
  destination_port text not null,
  cargo_type text not null,
  weight numeric not null default 0,
  volume numeric not null default 0,
  container_type text,
  shipment_mode text,
  incoterm text,
  requested_date text,
  special_instructions text,
  status public.booking_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id text primary key default gen_random_uuid()::text,
  booking_id text not null references public.bookings(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  reference_number text not null,
  status public.booking_status not null default 'confirmed',
  current_location text,
  current_port text,
  estimated_arrival text,
  origin_port text not null,
  destination_port text not null,
  vessel text,
  container_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracking_events (
  id text primary key default gen_random_uuid()::text,
  shipment_id text not null references public.shipments(id) on delete cascade,
  status public.booking_status not null,
  location text not null,
  port text,
  description text not null,
  timestamp timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key default gen_random_uuid()::text,
  booking_id text references public.bookings(id) on delete set null,
  shipment_id text references public.shipments(id) on delete set null,
  client_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type public.document_type not null default 'other',
  size text,
  file_url text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id text primary key default gen_random_uuid()::text,
  client_id uuid not null references auth.users(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  unread_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key default gen_random_uuid()::text,
  conversation_id text not null references public.conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  content text not null,
  read boolean not null default false,
  attachment text,
  created_at timestamptz not null default now()
);

create table if not exists public.reclamations (
  id text primary key default gen_random_uuid()::text,
  client_id uuid not null references auth.users(id) on delete cascade,
  booking_ref text,
  subject text not null,
  description text not null,
  priority public.reclamation_priority not null default 'low',
  status public.reclamation_status not null default 'open',
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null default 'info',
  title text not null,
  description text,
  read boolean not null default false,
  icon text,
  action_url text,
  created_at timestamptz not null default now()
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
  );
$$;

-- =========================
-- Indexes
-- =========================
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_last_seen_at on public.profiles(last_seen_at);
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_bookings_client_id on public.bookings(client_id);
create index if not exists idx_shipments_client_id on public.shipments(client_id);
create index if not exists idx_shipments_booking_id on public.shipments(booking_id);
create index if not exists idx_tracking_events_shipment_id on public.tracking_events(shipment_id);
create index if not exists idx_documents_client_id on public.documents(client_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_conversations_client_id on public.conversations(client_id);
create index if not exists idx_reclamations_client_id on public.reclamations(client_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- =========================
-- Triggers
-- =========================
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists trg_shipments_updated_at on public.shipments;
create trigger trg_shipments_updated_at
before update on public.shipments
for each row execute function public.set_updated_at();

drop trigger if exists trg_conversations_updated_at on public.conversations;
create trigger trg_conversations_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists trg_reclamations_updated_at on public.reclamations;
create trigger trg_reclamations_updated_at
before update on public.reclamations
for each row execute function public.set_updated_at();

-- =========================
-- Auto profile/role on signup
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Utilisateur')
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Backfill existing auth users (created before trigger setup)
insert into public.profiles (user_id, full_name)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1), 'Utilisateur')
from auth.users u
on conflict (user_id) do nothing;

update public.profiles
set last_seen_at = now()
where last_seen_at is null;

insert into public.user_roles (user_id, role)
select u.id, 'client'::public.app_role
from auth.users u
on conflict (user_id) do nothing;

-- =========================
-- RLS
-- =========================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.bookings enable row level security;
alter table public.shipments enable row level security;
alter table public.tracking_events enable row level security;
alter table public.documents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reclamations enable row level security;
alter table public.notifications enable row level security;

-- Profiles

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
for insert
with check (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
)
with check (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
);

-- User roles

drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles
for select
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists user_roles_insert on public.user_roles;
create policy user_roles_insert on public.user_roles
for insert
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists user_roles_update on public.user_roles;
create policy user_roles_update on public.user_roles
for update
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Bookings

drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings
for select
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings
for insert
with check (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings
for update
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
)
with check (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists bookings_delete on public.bookings;
create policy bookings_delete on public.bookings
for delete
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

-- Shipments

drop policy if exists shipments_select on public.shipments;
create policy shipments_select on public.shipments
for select
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists shipments_insert on public.shipments;
create policy shipments_insert on public.shipments
for insert
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
  or client_id = auth.uid()
);

drop policy if exists shipments_update on public.shipments;
create policy shipments_update on public.shipments
for update
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
  or client_id = auth.uid()
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
  or client_id = auth.uid()
);

-- Tracking events

drop policy if exists tracking_events_select on public.tracking_events;
create policy tracking_events_select on public.tracking_events
for select
using (
  exists (
    select 1
    from public.shipments s
    where s.id = tracking_events.shipment_id
      and (
        s.client_id = auth.uid()
        or public.has_role(auth.uid(), 'admin')
        or public.has_role(auth.uid(), 'manager')
      )
  )
);

drop policy if exists tracking_events_insert on public.tracking_events;
create policy tracking_events_insert on public.tracking_events
for insert
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists tracking_events_update on public.tracking_events;
create policy tracking_events_update on public.tracking_events
for update
using (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
)
with check (
  public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

-- Documents

drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
for select
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents
for insert
with check (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists documents_update on public.documents;
create policy documents_update on public.documents
for update
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
)
with check (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

-- Conversations

drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
for select
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
for insert
with check (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists conversations_update on public.conversations;
create policy conversations_update on public.conversations
for update
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
)
with check (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

-- Messages

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
for select
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (
        c.client_id = auth.uid()
        or public.has_role(auth.uid(), 'admin')
        or public.has_role(auth.uid(), 'manager')
      )
  )
);

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
for insert
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (
        c.client_id = auth.uid()
        or public.has_role(auth.uid(), 'admin')
        or public.has_role(auth.uid(), 'manager')
      )
  )
);

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
for update
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (
        c.client_id = auth.uid()
        or public.has_role(auth.uid(), 'admin')
        or public.has_role(auth.uid(), 'manager')
      )
  )
)
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (
        c.client_id = auth.uid()
        or public.has_role(auth.uid(), 'admin')
        or public.has_role(auth.uid(), 'manager')
      )
  )
);

-- Reclamations

drop policy if exists reclamations_select on public.reclamations;
create policy reclamations_select on public.reclamations
for select
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists reclamations_insert on public.reclamations;
create policy reclamations_insert on public.reclamations
for insert
with check (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists reclamations_update on public.reclamations;
create policy reclamations_update on public.reclamations
for update
using (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
)
with check (
  client_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

-- Notifications

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
for select
using (
  user_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
for insert
with check (
  user_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
for update
using (
  user_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
)
with check (
  user_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
  or public.has_role(auth.uid(), 'manager')
);

-- =========================
-- Optional role seed helper
-- Run after users are created in Auth
-- =========================
-- Example: assign admin role
-- insert into public.user_roles (user_id, role)
-- select id, 'admin'::public.app_role
-- from auth.users
-- where email = 'admin@your-domain.com'
-- on conflict (user_id) do update set role = excluded.role;

-- Example: assign manager role
-- insert into public.user_roles (user_id, role)
-- select id, 'manager'::public.app_role
-- from auth.users
-- where email = 'manager@your-domain.com'
-- on conflict (user_id) do update set role = excluded.role;

-- =========================
-- Storage bucket + policies (documents)
-- =========================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists documents_storage_select on storage.objects;
create policy documents_storage_select on storage.objects
for select
using (
  bucket_id = 'documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'manager')
  )
);

drop policy if exists documents_storage_insert on storage.objects;
create policy documents_storage_insert on storage.objects
for insert
with check (
  bucket_id = 'documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'manager')
  )
);

drop policy if exists documents_storage_update on storage.objects;
create policy documents_storage_update on storage.objects
for update
using (
  bucket_id = 'documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'manager')
  )
)
with check (
  bucket_id = 'documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'manager')
  )
);

drop policy if exists documents_storage_delete on storage.objects;
create policy documents_storage_delete on storage.objects
for delete
using (
  bucket_id = 'documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'manager')
  )
);
