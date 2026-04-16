import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  type User, type BookingRequest, type Shipment, type TrackingEvent,
  type Document, type Message, type Conversation, type Reclamation, type Notification,
  users as defaultUsers, bookingRequests as defaultBookings, shipments as defaultShipments,
  trackingEvents as defaultTrackingEvents, documents as defaultDocuments,
  messages as defaultMessages, conversations as defaultConversations,
  reclamations as defaultReclamations, notifications as defaultNotifications,
} from '@/data/mockData';

interface StoreContextType {
  users: User[];
  bookingRequests: BookingRequest[];
  shipments: Shipment[];
  trackingEvents: TrackingEvent[];
  documents: Document[];
  messages: Message[];
  conversations: Conversation[];
  reclamations: Reclamation[];
  notifications: Notification[];

  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;

  addBooking: (booking: BookingRequest) => void;
  updateBooking: (id: string, data: Partial<BookingRequest>) => void;
  deleteBooking: (id: string) => void;

  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, data: Partial<Shipment>) => void;

  addTrackingEvent: (event: TrackingEvent) => void;

  addDocument: (doc: Document) => void;

  addMessage: (msg: Message) => void;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
  addConversation: (conv: Conversation) => void;

  addReclamation: (rec: Reclamation) => void;
  updateReclamation: (id: string, data: Partial<Reclamation>) => void;

  addNotification: (notif: Notification) => void;
  updateNotification: (id: string, data: Partial<Notification>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LS_KEY = 'logistics_store';

function loadFromLS<T>(key: string, defaults: T[]): T[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const store = JSON.parse(raw);
      if (store[key] && Array.isArray(store[key]) && store[key].length > 0) return store[key];
    }
  } catch {}
  return [...defaults];
}

function loadStore() {
  return {
    users: loadFromLS<User>('users', defaultUsers),
    bookingRequests: loadFromLS<BookingRequest>('bookingRequests', defaultBookings),
    shipments: loadFromLS<Shipment>('shipments', defaultShipments),
    trackingEvents: loadFromLS<TrackingEvent>('trackingEvents', defaultTrackingEvents),
    documents: loadFromLS<Document>('documents', defaultDocuments),
    messages: loadFromLS<Message>('messages', defaultMessages),
    conversations: loadFromLS<Conversation>('conversations', defaultConversations),
    reclamations: loadFromLS<Reclamation>('reclamations', defaultReclamations),
    notifications: loadFromLS<Notification>('notifications', defaultNotifications),
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadStore().users);
  const [bookingRequests, setBookings] = useState<BookingRequest[]>(() => loadStore().bookingRequests);
  const [shipments, setShipments] = useState<Shipment[]>(() => loadStore().shipments);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>(() => loadStore().trackingEvents);
  const [documents, setDocuments] = useState<Document[]>(() => loadStore().documents);
  const [messages, setMessages] = useState<Message[]>(() => loadStore().messages);
  const [conversations, setConversations] = useState<Conversation[]>(() => loadStore().conversations);
  const [reclamations, setReclamations] = useState<Reclamation[]>(() => loadStore().reclamations);
  const [notifications, setNotifications] = useState<Notification[]>(() => loadStore().notifications);

  // Persist to localStorage on any change
  useEffect(() => {
    const data = { users, bookingRequests, shipments, trackingEvents, documents, messages, conversations, reclamations, notifications };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [users, bookingRequests, shipments, trackingEvents, documents, messages, conversations, reclamations, notifications]);

  const addUser = useCallback((user: User) => setUsers(prev => [...prev, user]), []);
  const updateUser = useCallback((id: string, data: Partial<User>) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u)), []);

  const addBooking = useCallback((booking: BookingRequest) => setBookings(prev => [...prev, booking]), []);
  const updateBooking = useCallback((id: string, data: Partial<BookingRequest>) => setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b)), []);
  const deleteBooking = useCallback((id: string) => setBookings(prev => prev.filter(b => b.id !== id)), []);

  const addShipment = useCallback((shipment: Shipment) => setShipments(prev => [...prev, shipment]), []);
  const updateShipment = useCallback((id: string, data: Partial<Shipment>) => setShipments(prev => prev.map(s => s.id === id ? { ...s, ...data } : s)), []);

  const addTrackingEvent = useCallback((event: TrackingEvent) => setTrackingEvents(prev => [...prev, event]), []);

  const addDocument = useCallback((doc: Document) => setDocuments(prev => [...prev, doc]), []);

  const addMessage = useCallback((msg: Message) => setMessages(prev => [...prev, msg]), []);
  const updateConversation = useCallback((id: string, data: Partial<Conversation>) => setConversations(prev => prev.map(c => c.id === id ? { ...c, ...data } : c)), []);
  const addConversation = useCallback((conv: Conversation) => setConversations(prev => [...prev, conv]), []);

  const addReclamation = useCallback((rec: Reclamation) => setReclamations(prev => [...prev, rec]), []);
  const updateReclamation = useCallback((id: string, data: Partial<Reclamation>) => setReclamations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r)), []);

  const addNotification = useCallback((notif: Notification) => setNotifications(prev => [...prev, notif]), []);
  const updateNotification = useCallback((id: string, data: Partial<Notification>) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...data } : n)), []);

  return (
    <StoreContext.Provider value={{
      users, bookingRequests, shipments, trackingEvents, documents, messages, conversations, reclamations, notifications,
      addUser, updateUser,
      addBooking, updateBooking, deleteBooking,
      addShipment, updateShipment,
      addTrackingEvent, addDocument,
      addMessage, updateConversation, addConversation,
      addReclamation, updateReclamation,
      addNotification, updateNotification,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
