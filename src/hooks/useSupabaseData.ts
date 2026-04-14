import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

// ============= BOOKINGS =============
export function useMyBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bookings', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: TablesInsert<'bookings'>) => {
      const { data, error } = await supabase.from('bookings').insert(booking).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status: status as any }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// ============= SHIPMENTS =============
export function useMyShipments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['shipments', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllShipments() {
  return useQuery({
    queryKey: ['shipments', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; current_location?: string; current_port?: string; estimated_arrival?: string }) => {
      const { error } = await supabase.from('shipments').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

// ============= TRACKING EVENTS =============
export function useTrackingEvents(shipmentId?: string) {
  return useQuery({
    queryKey: ['tracking_events', shipmentId],
    queryFn: async () => {
      let query = supabase.from('tracking_events').select('*').order('timestamp', { ascending: true });
      if (shipmentId) query = query.eq('shipment_id', shipmentId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!shipmentId,
  });
}

// ============= DOCUMENTS =============
export function useMyDocuments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['documents', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllDocuments() {
  return useQuery({
    queryKey: ['documents', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ============= CONVERSATIONS & MESSAGES =============
export function useMyConversation() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['conversations', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllConversations() {
  return useQuery({
    queryKey: ['conversations', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (msg: TablesInsert<'messages'>) => {
      const { data, error } = await supabase.from('messages').insert(msg).select().single();
      if (error) throw error;
      // Update conversation last message
      await supabase.from('conversations').update({
        last_message: msg.content,
        last_message_at: new Date().toISOString(),
      }).eq('id', msg.conversation_id);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['messages', vars.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      const { data, error } = await supabase.from('conversations').insert({ client_id: clientId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// ============= RECLAMATIONS =============
export function useMyReclamations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['reclamations', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reclamations')
        .select('*')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllReclamations() {
  return useQuery({
    queryKey: ['reclamations', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reclamations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReclamation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rec: TablesInsert<'reclamations'>) => {
      const { data, error } = await supabase.from('reclamations').insert(rec).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reclamations'] });
    },
  });
}

export function useUpdateReclamation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; admin_response?: string }) => {
      const { error } = await supabase.from('reclamations').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reclamations'] });
    },
  });
}

// ============= NOTIFICATIONS =============
export function useMyNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// ============= PROFILES (admin/manager) =============
export function useAllProfiles() {
  return useQuery({
    queryKey: ['profiles', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useClientProfiles() {
  return useQuery({
    queryKey: ['profiles', 'clients'],
    queryFn: async () => {
      // Get client role user_ids
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');
      
      if (!roleData || roleData.length === 0) return [];
      
      const clientIds = roleData.map(r => r.user_id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', clientIds);
      if (error) throw error;
      return data;
    },
  });
}
