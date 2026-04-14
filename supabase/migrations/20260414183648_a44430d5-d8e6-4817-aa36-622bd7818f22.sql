
-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'manager');
CREATE TYPE public.booking_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'confirmed', 'in_transit', 'arrived_port', 'customs', 'delivering', 'delivered');
CREATE TYPE public.reclamation_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.reclamation_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.document_type AS ENUM ('invoice', 'packing_list', 'customs', 'transport', 'contract', 'other');
CREATE TYPE public.notification_type AS ENUM ('message', 'status_update', 'alert', 'success', 'info');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  rne_file TEXT,
  patente_file TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile + client role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, company, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'phone'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  origin_country TEXT NOT NULL,
  origin_port TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  cargo_type TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  volume NUMERIC NOT NULL DEFAULT 0,
  container_type TEXT,
  shipment_mode TEXT CHECK (shipment_mode IN ('FCL', 'LCL')),
  incoterm TEXT,
  requested_date DATE,
  special_instructions TEXT,
  status booking_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Shipments table
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_number TEXT NOT NULL UNIQUE,
  status booking_status NOT NULL DEFAULT 'confirmed',
  current_location TEXT,
  current_port TEXT,
  estimated_arrival DATE,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  vessel TEXT,
  container_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Tracking events
CREATE TABLE public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  status booking_status NOT NULL,
  location TEXT NOT NULL,
  port TEXT,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type document_type NOT NULL DEFAULT 'other',
  size TEXT,
  file_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  attachment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Reclamations
CREATE TABLE public.reclamations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_ref TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority reclamation_priority NOT NULL DEFAULT 'medium',
  status reclamation_status NOT NULL DEFAULT 'open',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reclamations ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  icon TEXT,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reclamations_updated_at BEFORE UPDATE ON public.reclamations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_shipments_client_id ON public.shipments(client_id);
CREATE INDEX idx_shipments_booking_id ON public.shipments(booking_id);
CREATE INDEX idx_tracking_events_shipment_id ON public.tracking_events(shipment_id);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_reclamations_client_id ON public.reclamations(client_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- ============= RLS POLICIES =============

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Bookings
CREATE POLICY "Clients can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers can update bookings" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'manager'));

-- Shipments
CREATE POLICY "Clients can view own shipments" ON public.shipments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage all shipments" ON public.shipments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can view all shipments" ON public.shipments FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- Tracking events
CREATE POLICY "Clients can view own tracking" ON public.tracking_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_id AND s.client_id = auth.uid())
);
CREATE POLICY "Admins can manage tracking" ON public.tracking_events FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can view tracking" ON public.tracking_events FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- Documents
CREATE POLICY "Clients can view own documents" ON public.documents FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can upload documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can manage all documents" ON public.documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can view all documents" ON public.documents FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- Conversations
CREATE POLICY "Clients can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can manage all conversations" ON public.conversations FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can view all conversations" ON public.conversations FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- Messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conversation_id
    AND (c.client_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  )
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins can manage messages" ON public.messages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Reclamations
CREATE POLICY "Clients can view own reclamations" ON public.reclamations FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create reclamations" ON public.reclamations FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can manage all reclamations" ON public.reclamations FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can view all reclamations" ON public.reclamations FOR SELECT USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers can update reclamations" ON public.reclamations FOR UPDATE USING (public.has_role(auth.uid(), 'manager'));

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for user documents
INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', false);

CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'user-documents' AND public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Managers can view all documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'user-documents' AND public.has_role(auth.uid(), 'manager')
);
