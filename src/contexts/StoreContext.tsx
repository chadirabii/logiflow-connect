import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  type User,
  type BookingRequest,
  type Shipment,
  type TrackingEvent,
  type Document,
  type Message,
  type Conversation,
  type Reclamation,
  type Notification,
} from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import type {
  Enums,
  Tables,
  TablesInsert,
} from "@/integrations/supabase/types";

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

  addUser: (user: User) => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    id: string,
    data: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;

  addBooking: (
    booking: BookingRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  updateBooking: (
    id: string,
    data: Partial<BookingRequest>,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteBooking: (id: string) => Promise<{ success: boolean; error?: string }>;

  addShipment: (
    shipment: Shipment,
  ) => Promise<{ success: boolean; error?: string }>;
  updateShipment: (
    id: string,
    data: Partial<Shipment>,
  ) => Promise<{ success: boolean; error?: string }>;

  addTrackingEvent: (
    event: TrackingEvent,
  ) => Promise<{ success: boolean; error?: string }>;

  addDocument: (doc: Document) => Promise<{ success: boolean; error?: string }>;
  uploadDocumentFile: (params: {
    file: File;
    clientId: string;
    uploadedBy: string;
    type: Document["type"];
    bookingId?: string;
    shipmentId?: string;
  }) => Promise<{ success: boolean; error?: string; document?: Document }>;
  getDocumentDownloadUrl: (
    doc: Document,
  ) => Promise<{ success: boolean; error?: string; url?: string }>;

  addMessage: (msg: Message) => Promise<{ success: boolean; error?: string }>;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
  addConversation: (
    conv: Conversation,
  ) => Promise<{ success: boolean; error?: string }>;

  addReclamation: (
    rec: Reclamation,
  ) => Promise<{ success: boolean; error?: string }>;
  updateReclamation: (
    id: string,
    data: Partial<Reclamation>,
  ) => Promise<{ success: boolean; error?: string }>;

  addNotification: (
    notif: Notification,
  ) => Promise<{ success: boolean; error?: string }>;
  updateNotification: (
    id: string,
    data: Partial<Notification>,
  ) => Promise<{ success: boolean; error?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

type BookingStatus = Enums<"booking_status">;
type ReclamationStatus = Enums<"reclamation_status">;
type ReclamationPriority = Enums<"reclamation_priority">;
type NotificationType = Enums<"notification_type">;
type DocumentType = Enums<"document_type">;
type AppRole = Enums<"app_role">;
type MutationResult = { success: boolean; error?: string };

function getErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }
  return "";
}

function toBooking(row: Tables<"bookings">): BookingRequest {
  return {
    id: row.id,
    clientId: row.client_id,
    referenceNumber: row.reference_number,
    fullName: row.full_name,
    company: row.company ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    originCountry: row.origin_country,
    originPort: row.origin_port,
    destinationCountry: row.destination_country,
    destinationPort: row.destination_port,
    cargoType: row.cargo_type,
    weight: row.weight,
    volume: row.volume,
    containerType: row.container_type ?? "",
    shipmentMode: (row.shipment_mode as "FCL" | "LCL") || "FCL",
    incoterm: row.incoterm ?? "",
    requestedDate: row.requested_date ?? "",
    specialInstructions: row.special_instructions ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toShipment(row: Tables<"shipments">): Shipment {
  return {
    id: row.id,
    bookingId: row.booking_id,
    clientId: row.client_id,
    referenceNumber: row.reference_number,
    status: row.status,
    currentLocation: row.current_location ?? "",
    currentPort: row.current_port ?? "",
    estimatedArrival: row.estimated_arrival ?? "",
    originPort: row.origin_port,
    destinationPort: row.destination_port,
    vessel: row.vessel ?? undefined,
    containerNumber: row.container_number ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTrackingEvent(row: Tables<"tracking_events">): TrackingEvent {
  return {
    id: row.id,
    shipmentId: row.shipment_id,
    status: row.status,
    location: row.location,
    port: row.port ?? undefined,
    description: row.description,
    timestamp: row.timestamp,
  };
}

function toDocument(row: Tables<"documents">): Document {
  return {
    id: row.id,
    bookingId: row.booking_id ?? undefined,
    shipmentId: row.shipment_id ?? undefined,
    clientId: row.client_id,
    name: row.name,
    type: row.type,
    size: row.size ?? "",
    fileUrl: row.file_url ?? undefined,
    uploadedBy: row.uploaded_by ?? "",
    createdAt: row.created_at,
  };
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value >= 100 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function toNotification(row: Tables<"notifications">): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    description: row.description ?? "",
    read: row.read,
    icon: (row.icon as Notification["icon"]) ?? undefined,
    actionUrl: row.action_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [bookingRequests, setBookings] = useState<BookingRequest[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const emailNotificationsEnabledRef = useRef(true);
  const presenceHeartbeatEnabledRef = useRef(true);

  const notifyOfflineClientsByEmail = useCallback(
    async ({
      recipientIds,
      includeAdmins = true,
      title,
      description,
      actionUrl,
      type,
    }: {
      recipientIds: string[];
      includeAdmins?: boolean;
      title: string;
      description: string;
      actionUrl?: string;
      type: NotificationType;
    }) => {
      if (!emailNotificationsEnabledRef.current) {
        return;
      }

      const uniqueRecipientIds = Array.from(
        new Set(recipientIds.filter((recipientId) => Boolean(recipientId))),
      );

      if (uniqueRecipientIds.length === 0 && !includeAdmins) {
        return;
      }

      try {
        const mailApiUrl =
          import.meta.env.VITE_MAIL_API_URL || "http://localhost:4000";
        const mailApiKey = import.meta.env.VITE_MAIL_API_KEY;

        const response = await fetch(`${mailApiUrl}/notifications/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(mailApiKey ? { "X-Api-Key": mailApiKey } : {}),
          },
          body: JSON.stringify({
            recipientIds: uniqueRecipientIds,
            includeAdmins,
            title,
            description,
            actionUrl,
            type,
          }),
        });

        if (!response.ok) {
          const responseData = await response
            .json()
            .catch(() => ({ error: "Unknown mail server error" }));
          const message = getErrorMessage(responseData.error).toLowerCase();
          const shouldDisableTemporarily =
            message.includes("failed to send") ||
            message.includes("cors") ||
            message.includes("not found") ||
            message.includes("fetch");

          if (shouldDisableTemporarily) {
            emailNotificationsEnabledRef.current = false;
            console.warn(
              "Email notifications disabled for this session: mail server is unreachable or misconfigured, then refresh.",
            );
            return;
          }

          console.error("Failed to send notification emails:", responseData);
        }
      } catch (error) {
        emailNotificationsEnabledRef.current = false;
        console.warn(
          "Email notifications disabled for this session due to mail API request failure.",
          error,
        );
      }
    },
    [],
  );

  const createInAppNotificationsServerSide = useCallback(
    async ({
      recipientIds,
      roles,
      type,
      title,
      description,
      icon,
      actionUrl,
    }: {
      recipientIds?: string[];
      roles?: string[];
      type: NotificationType;
      title: string;
      description: string;
      icon?: Notification["icon"];
      actionUrl?: string;
    }) => {
      const mailApiUrl =
        import.meta.env.VITE_MAIL_API_URL || "http://localhost:4000";
      const mailApiKey = import.meta.env.VITE_MAIL_API_KEY;

      const response = await fetch(`${mailApiUrl}/notifications/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(mailApiKey ? { "X-Api-Key": mailApiKey } : {}),
        },
        body: JSON.stringify({
          recipientIds: recipientIds ?? [],
          roles: roles ?? [],
          type,
          title,
          description,
          icon,
          actionUrl,
        }),
      });

      if (!response.ok) {
        const responseData = await response
          .json()
          .catch(() => ({ error: "Unknown notification create error" }));
        throw new Error(
          getErrorMessage(responseData.error) ||
            "Failed to create notifications",
        );
      }
    },
    [],
  );

  const sendNotifications = useCallback(
    async ({
      userIds,
      includeAdmins = true,
      type,
      title,
      description,
      icon,
      actionUrl,
    }: {
      userIds: string[];
      includeAdmins?: boolean;
      type: NotificationType;
      title: string;
      description: string;
      icon?: Notification["icon"];
      actionUrl?: string;
    }) => {
      const uniqueUserIds = Array.from(
        new Set(userIds.filter((userId) => Boolean(userId))),
      );

      if (uniqueUserIds.length === 0 && !includeAdmins) {
        return;
      }

      if (uniqueUserIds.length > 0) {
        const createdAt = new Date().toISOString();
        const insertResult = await supabase
          .from("notifications")
          .insert(
            uniqueUserIds.map((userId) => ({
              user_id: userId,
              type,
              title,
              description,
              read: false,
              icon: icon ?? null,
              action_url: actionUrl ?? null,
              created_at: createdAt,
            })),
          )
          .select("*");

        if (insertResult.error) {
          console.error("Failed to insert notifications:", insertResult.error);
          return;
        }

        setNotifications((prev) => [
          ...(insertResult.data ?? []).map(toNotification),
          ...prev,
        ]);
      }

      void notifyOfflineClientsByEmail({
        recipientIds: uniqueUserIds,
        includeAdmins,
        title,
        description,
        actionUrl,
        type,
      });
    },
    [notifyOfflineClientsByEmail],
  );

  const getAdminAndManagerIds = useCallback(
    () =>
      users
        .filter((candidate) => ["admin", "manager"].includes(candidate.role))
        .map((candidate) => candidate.id),
    [users],
  );

  const loadSupabaseData = useCallback(async () => {
    const [
      bookingsResult,
      shipmentsResult,
      trackingResult,
      documentsResult,
      conversationsResult,
      messagesResult,
      reclamationsResult,
      notificationsResult,
      profilesResult,
      rolesResult,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("tracking_events")
        .select("*")
        .order("timestamp", { ascending: true }),
      supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false }),
      supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("reclamations")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*"),
    ]);

    const anyError = [
      bookingsResult.error,
      shipmentsResult.error,
      trackingResult.error,
      documentsResult.error,
      conversationsResult.error,
      messagesResult.error,
      reclamationsResult.error,
      notificationsResult.error,
      profilesResult.error,
      rolesResult.error,
    ].some(Boolean);

    if (anyError) {
      return;
    }

    const appBookings = (bookingsResult.data ?? []).map(toBooking);
    const bookingEmailByClientId = new Map<string, string>();
    appBookings.forEach((booking) => {
      if (booking.email) {
        bookingEmailByClientId.set(booking.clientId, booking.email);
      }
    });

    const roleByUserId = new Map<string, AppRole>();
    (rolesResult.data ?? []).forEach((entry) => {
      roleByUserId.set(entry.user_id, entry.role);
    });

    const mappedUsers: User[] = (profilesResult.data ?? []).map((profile) => ({
      id: profile.user_id,
      email:
        bookingEmailByClientId.get(profile.user_id) ??
        `${profile.user_id}@user.local`,
      password: "",
      role: roleByUserId.get(profile.user_id) ?? "client",
      fullName: profile.full_name,
      company: profile.company ?? undefined,
      phone: profile.phone ?? undefined,
      rneFile: profile.rne_file ?? undefined,
      patenteFile: profile.patente_file ?? undefined,
      avatar: profile.avatar_url ?? undefined,
      createdAt: profile.created_at.split("T")[0],
    }));

    const userById = new Map(mappedUsers.map((user) => [user.id, user]));

    const mappedConversations: Conversation[] = (
      conversationsResult.data ?? []
    ).map((conversation) => ({
      id: conversation.id,
      clientId: conversation.client_id,
      clientName: userById.get(conversation.client_id)?.fullName ?? "Client",
      lastMessage: conversation.last_message ?? "",
      lastMessageAt: conversation.last_message_at ?? conversation.created_at,
      unreadCount: conversation.unread_count,
    }));

    const mappedMessages: Message[] = (messagesResult.data ?? []).map(
      (message) => {
        const sender = userById.get(message.sender_id ?? "");
        return {
          id: message.id,
          conversationId: message.conversation_id,
          senderId: message.sender_id ?? "",
          senderName: sender?.fullName ?? "Utilisateur",
          senderRole: (sender?.role ?? "client") as Message["senderRole"],
          content: message.content,
          read: message.read,
          attachment: message.attachment ?? undefined,
          createdAt: message.created_at,
        };
      },
    );

    const mappedReclamations: Reclamation[] = (
      reclamationsResult.data ?? []
    ).map((reclamation) => ({
      id: reclamation.id,
      clientId: reclamation.client_id,
      clientName: userById.get(reclamation.client_id)?.fullName ?? "Client",
      bookingRef: reclamation.booking_ref ?? undefined,
      subject: reclamation.subject,
      description: reclamation.description,
      priority: reclamation.priority,
      status: reclamation.status,
      adminResponse: reclamation.admin_response ?? undefined,
      createdAt: reclamation.created_at,
      updatedAt: reclamation.updated_at,
    }));

    setUsers(mappedUsers);
    setBookings(appBookings);
    setShipments((shipmentsResult.data ?? []).map(toShipment));
    setTrackingEvents((trackingResult.data ?? []).map(toTrackingEvent));
    setDocuments((documentsResult.data ?? []).map(toDocument));
    setConversations(mappedConversations);
    setMessages(mappedMessages);
    setReclamations(mappedReclamations);
    setNotifications((notificationsResult.data ?? []).map(toNotification));
  }, []);

  useEffect(() => {
    void loadSupabaseData();

    const refreshInterval = window.setInterval(() => {
      void loadSupabaseData();
    }, 1500);

    const handleFocus = () => {
      void loadSupabaseData();
    };

    window.addEventListener("focus", handleFocus);

    const channel = supabase
      .channel("store-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          void loadSupabaseData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          void loadSupabaseData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          void loadSupabaseData();
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", handleFocus);
      void supabase.removeChannel(channel);
    };
  }, [loadSupabaseData]);

  useEffect(() => {
    let active = true;

    const heartbeat = async () => {
      if (!presenceHeartbeatEnabledRef.current) {
        return;
      }

      const authResult = await supabase.auth.getUser();
      const authUserId = authResult.data.user?.id;

      if (!active || !authUserId) {
        return;
      }

      const updateResult = await supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("user_id", authUserId);

      if (updateResult.error) {
        const message = updateResult.error.message.toLowerCase();
        const missingColumnError =
          message.includes("last_seen_at") &&
          (message.includes("column") || message.includes("schema cache"));

        if (missingColumnError) {
          presenceHeartbeatEnabledRef.current = false;
          console.warn(
            "Presence heartbeat disabled: run supabase/setup.sql to add profiles.last_seen_at, then refresh.",
          );
          return;
        }

        console.error(
          "Failed to update profiles.last_seen_at:",
          updateResult.error,
        );
      }
    };

    void heartbeat();
    const intervalId = window.setInterval(() => {
      void heartbeat();
    }, 60_000);

    const onFocus = () => {
      void heartbeat();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void heartbeat();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const addUser = useCallback(async (user: User): Promise<MutationResult> => {
    const profileResult = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        full_name: user.fullName,
        company: user.company ?? null,
        phone: user.phone ?? null,
        rne_file: user.rneFile ?? null,
        patente_file: user.patenteFile ?? null,
        avatar_url: user.avatar ?? null,
      },
      { onConflict: "user_id" },
    );

    if (profileResult.error) {
      return { success: false, error: profileResult.error.message };
    }

    const roleResult = await supabase
      .from("user_roles")
      .upsert({ user_id: user.id, role: user.role }, { onConflict: "user_id" });

    if (roleResult.error) {
      return { success: false, error: roleResult.error.message };
    }

    setUsers((prev) => [...prev, user]);
    return { success: true };
  }, []);

  const updateUser = useCallback(
    async (id: string, data: Partial<User>): Promise<MutationResult> => {
      const profileResult = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          company: data.company ?? null,
          phone: data.phone ?? null,
          rne_file: data.rneFile ?? null,
          patente_file: data.patenteFile ?? null,
          avatar_url: data.avatar ?? null,
        })
        .eq("user_id", id);

      if (profileResult.error) {
        return { success: false, error: profileResult.error.message };
      }

      if (data.role) {
        const roleResult = await supabase
          .from("user_roles")
          .upsert({ user_id: id, role: data.role }, { onConflict: "user_id" });

        if (roleResult.error) {
          return { success: false, error: roleResult.error.message };
        }
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data } : u)),
      );
      return { success: true };
    },
    [],
  );

  const addBooking = useCallback(
    async (booking: BookingRequest): Promise<MutationResult> => {
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      let effectiveClientId = booking.clientId;
      if (!uuidPattern.test(effectiveClientId)) {
        const authUserResult = await supabase.auth.getUser();
        const authUserId = authUserResult.data.user?.id;

        if (!authUserId) {
          return {
            success: false,
            error:
              "Impossible de créer la commande: utilisateur authentifié introuvable.",
          };
        }

        effectiveClientId = authUserId;
      }

      const payload: TablesInsert<"bookings"> = {
        id: booking.id,
        client_id: effectiveClientId,
        reference_number: booking.referenceNumber,
        full_name: booking.fullName,
        company: booking.company,
        email: booking.email,
        phone: booking.phone,
        origin_country: booking.originCountry,
        origin_port: booking.originPort,
        destination_country: booking.destinationCountry,
        destination_port: booking.destinationPort,
        cargo_type: booking.cargoType,
        weight: booking.weight,
        volume: booking.volume,
        container_type: booking.containerType,
        shipment_mode: booking.shipmentMode,
        incoterm: booking.incoterm,
        requested_date: booking.requestedDate,
        special_instructions: booking.specialInstructions ?? null,
        status: booking.status as BookingStatus,
        created_at: booking.createdAt,
        updated_at: booking.updatedAt,
      };

      const insertResult = await supabase.from("bookings").insert(payload);

      if (insertResult.error) {
        return { success: false, error: insertResult.error.message };
      }

      const normalizedBooking = { ...booking, clientId: effectiveClientId };
      setBookings((prev) => [...prev, normalizedBooking]);

      await sendNotifications({
        userIds: [effectiveClientId],
        type: "success",
        title: "Réservation créée",
        description: `Votre réservation ${booking.referenceNumber} a été enregistrée.`,
        icon: "check",
        actionUrl: "/client/orders",
      });

      await sendNotifications({
        userIds: getAdminAndManagerIds(),
        type: "info",
        title: "Nouvelle demande de réservation",
        description: `Nouvelle demande ${booking.referenceNumber} de ${booking.fullName}.`,
        icon: "package",
        actionUrl: "/admin/requests",
      });

      return { success: true };
    },
    [getAdminAndManagerIds, sendNotifications],
  );

  const updateBooking = useCallback(
    async (
      id: string,
      data: Partial<BookingRequest>,
    ): Promise<MutationResult> => {
      const currentBooking = bookingRequests.find(
        (booking) => booking.id === id,
      );
      const updateResult = await supabase
        .from("bookings")
        .update({
          client_id: data.clientId,
          reference_number: data.referenceNumber,
          full_name: data.fullName,
          company: data.company,
          email: data.email,
          phone: data.phone,
          origin_country: data.originCountry,
          origin_port: data.originPort,
          destination_country: data.destinationCountry,
          destination_port: data.destinationPort,
          cargo_type: data.cargoType,
          weight: data.weight,
          volume: data.volume,
          container_type: data.containerType,
          shipment_mode: data.shipmentMode,
          incoterm: data.incoterm,
          requested_date: data.requestedDate,
          special_instructions: data.specialInstructions,
          status: data.status as BookingStatus | undefined,
          updated_at: data.updatedAt ?? new Date().toISOString(),
        })
        .eq("id", id);

      if (updateResult.error) {
        return { success: false, error: updateResult.error.message };
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data } : b)),
      );

      const statusChanged =
        Boolean(data.status) && data.status !== currentBooking?.status;

      if (statusChanged && currentBooking) {
        const nextStatus = data.status as BookingStatus;
        const shipmentStatuses: BookingStatus[] = [
          "confirmed",
          "in_transit",
          "arrived_port",
          "customs",
          "delivering",
          "delivered",
        ];

        if (shipmentStatuses.includes(nextStatus)) {
          const existingShipment = shipments.find(
            (shipment) => shipment.bookingId === currentBooking.id,
          );

          if (!existingShipment) {
            const shipmentId = `sh-${crypto.randomUUID().slice(0, 8)}`;
            const createdAt = new Date().toISOString();
            const newShipment: Shipment = {
              id: shipmentId,
              bookingId: currentBooking.id,
              clientId: currentBooking.clientId,
              referenceNumber:
                data.referenceNumber ?? currentBooking.referenceNumber,
              status: nextStatus,
              currentLocation: "",
              currentPort: "",
              estimatedArrival: "",
              originPort: data.originPort ?? currentBooking.originPort,
              destinationPort:
                data.destinationPort ?? currentBooking.destinationPort,
              vessel: undefined,
              containerNumber: undefined,
              createdAt,
              updatedAt: createdAt,
            };

            const shipmentInsert = await supabase.from("shipments").insert({
              id: newShipment.id,
              booking_id: newShipment.bookingId,
              client_id: newShipment.clientId,
              reference_number: newShipment.referenceNumber,
              status: newShipment.status as BookingStatus,
              current_location: newShipment.currentLocation,
              current_port: newShipment.currentPort,
              estimated_arrival: newShipment.estimatedArrival,
              origin_port: newShipment.originPort,
              destination_port: newShipment.destinationPort,
              vessel: newShipment.vessel ?? null,
              container_number: newShipment.containerNumber ?? null,
              created_at: newShipment.createdAt,
              updated_at: newShipment.updatedAt,
            });

            if (!shipmentInsert.error) {
              setShipments((prev) => [...prev, newShipment]);
            }
          } else {
            const shipmentUpdate = await supabase
              .from("shipments")
              .update({
                status: nextStatus,
                reference_number:
                  data.referenceNumber ?? existingShipment.referenceNumber,
                origin_port: data.originPort ?? existingShipment.originPort,
                destination_port:
                  data.destinationPort ?? existingShipment.destinationPort,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingShipment.id);

            if (!shipmentUpdate.error) {
              setShipments((prev) =>
                prev.map((shipment) =>
                  shipment.id === existingShipment.id
                    ? {
                        ...shipment,
                        status: nextStatus,
                        referenceNumber:
                          data.referenceNumber ?? shipment.referenceNumber,
                        originPort: data.originPort ?? shipment.originPort,
                        destinationPort:
                          data.destinationPort ?? shipment.destinationPort,
                        updatedAt: new Date().toISOString(),
                      }
                    : shipment,
                ),
              );
            }
          }
        }

        await sendNotifications({
          userIds: [currentBooking.clientId],
          type: "status_update",
          title: "Statut de réservation mis à jour",
          description: `${currentBooking.referenceNumber} est maintenant: ${data.status}.`,
          icon: "package",
          actionUrl: "/client/orders",
        });

        await sendNotifications({
          userIds: getAdminAndManagerIds(),
          type: "status_update",
          title: "Demande mise à jour",
          description: `${currentBooking.referenceNumber} est maintenant: ${data.status}.`,
          icon: "package",
          actionUrl: "/admin/requests",
        });
      }

      return { success: true };
    },
    [bookingRequests, getAdminAndManagerIds, sendNotifications, shipments],
  );

  const deleteBooking = useCallback(
    async (id: string): Promise<MutationResult> => {
      const deleteResult = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (deleteResult.error) {
        return { success: false, error: deleteResult.error.message };
      }

      setBookings((prev) => prev.filter((b) => b.id !== id));
      return { success: true };
    },
    [],
  );

  const addShipment = useCallback(
    async (shipment: Shipment): Promise<MutationResult> => {
      const insertResult = await supabase.from("shipments").insert({
        id: shipment.id,
        booking_id: shipment.bookingId,
        client_id: shipment.clientId,
        reference_number: shipment.referenceNumber,
        status: shipment.status as BookingStatus,
        current_location: shipment.currentLocation,
        current_port: shipment.currentPort,
        estimated_arrival: shipment.estimatedArrival,
        origin_port: shipment.originPort,
        destination_port: shipment.destinationPort,
        vessel: shipment.vessel ?? null,
        container_number: shipment.containerNumber ?? null,
        created_at: shipment.createdAt,
        updated_at: shipment.updatedAt,
      });

      if (insertResult.error) {
        return { success: false, error: insertResult.error.message };
      }

      setShipments((prev) => [...prev, shipment]);

      await sendNotifications({
        userIds: [shipment.clientId],
        type: "status_update",
        title: "Nouvelle expédition",
        description: `Une expédition ${shipment.referenceNumber} a été créée pour votre commande.`,
        icon: "package",
        actionUrl: "/client/tracking",
      });

      await sendNotifications({
        userIds: getAdminAndManagerIds(),
        type: "info",
        title: "Expédition créée",
        description: `Expédition ${shipment.referenceNumber} créée (${shipment.originPort} → ${shipment.destinationPort}).`,
        icon: "package",
        actionUrl: "/admin/shipments",
      });

      return { success: true };
    },
    [getAdminAndManagerIds, sendNotifications],
  );

  const updateShipment = useCallback(
    async (id: string, data: Partial<Shipment>): Promise<MutationResult> => {
      const currentShipment = shipments.find((shipment) => shipment.id === id);
      const updateResult = await supabase
        .from("shipments")
        .update({
          booking_id: data.bookingId,
          client_id: data.clientId,
          reference_number: data.referenceNumber,
          status: data.status as BookingStatus | undefined,
          current_location: data.currentLocation,
          current_port: data.currentPort,
          estimated_arrival: data.estimatedArrival,
          origin_port: data.originPort,
          destination_port: data.destinationPort,
          vessel: data.vessel,
          container_number: data.containerNumber,
          updated_at: data.updatedAt ?? new Date().toISOString(),
        })
        .eq("id", id);

      if (updateResult.error) {
        return { success: false, error: updateResult.error.message };
      }

      setShipments((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
      );

      if (currentShipment) {
        const updatedStatus = data.status ?? currentShipment.status;
        const statusChanged =
          data.status && data.status !== currentShipment.status;
        const locationChanged =
          data.currentLocation &&
          data.currentLocation !== currentShipment.currentLocation;

        if (statusChanged || locationChanged || data.estimatedArrival) {
          await sendNotifications({
            userIds: [currentShipment.clientId],
            type: "status_update",
            title: "Mise à jour d'expédition",
            description: `${currentShipment.referenceNumber}: statut ${updatedStatus}${data.currentLocation ? `, position ${data.currentLocation}` : ""}.`,
            icon: "package",
            actionUrl: "/client/tracking",
          });

          await sendNotifications({
            userIds: getAdminAndManagerIds(),
            type: "status_update",
            title: "Expédition mise à jour",
            description: `${currentShipment.referenceNumber}: statut ${updatedStatus}${data.currentLocation ? `, position ${data.currentLocation}` : ""}.`,
            icon: "package",
            actionUrl: "/admin/shipments",
          });
        }
      }

      return { success: true };
    },
    [getAdminAndManagerIds, sendNotifications, shipments],
  );

  const addTrackingEvent = useCallback(
    async (event: TrackingEvent): Promise<MutationResult> => {
      const insertResult = await supabase.from("tracking_events").insert({
        id: event.id,
        shipment_id: event.shipmentId,
        status: event.status as BookingStatus,
        location: event.location,
        port: event.port ?? null,
        description: event.description,
        timestamp: event.timestamp,
      });

      if (insertResult.error) {
        return { success: false, error: insertResult.error.message };
      }

      setTrackingEvents((prev) => [...prev, event]);

      const relatedShipment = shipments.find(
        (shipment) => shipment.id === event.shipmentId,
      );

      if (relatedShipment) {
        await sendNotifications({
          userIds: [relatedShipment.clientId],
          type: "status_update",
          title: "Nouvel événement de suivi",
          description: `${relatedShipment.referenceNumber}: ${event.description}`,
          icon: "package",
          actionUrl: "/client/tracking",
        });

        await sendNotifications({
          userIds: getAdminAndManagerIds(),
          type: "info",
          title: "Événement de suivi ajouté",
          description: `${relatedShipment.referenceNumber}: ${event.description}`,
          icon: "package",
          actionUrl: "/admin/shipments",
        });
      }

      return { success: true };
    },
    [getAdminAndManagerIds, sendNotifications, shipments],
  );

  const addDocument = useCallback(
    async (doc: Document): Promise<MutationResult> => {
      const insertResult = await supabase.from("documents").insert({
        id: doc.id,
        booking_id: doc.bookingId ?? null,
        shipment_id: doc.shipmentId ?? null,
        client_id: doc.clientId,
        name: doc.name,
        type: doc.type as DocumentType,
        size: doc.size,
        file_url: doc.fileUrl ?? null,
        uploaded_by: doc.uploadedBy,
        created_at: doc.createdAt,
      });

      if (insertResult.error) {
        return { success: false, error: insertResult.error.message };
      }

      setDocuments((prev) => [...prev, doc]);

      await sendNotifications({
        userIds: [doc.clientId],
        type: "info",
        title: "Nouveau document",
        description: `Le document ${doc.name} est disponible.`,
        icon: "info",
        actionUrl: "/client/documents",
      });

      await sendNotifications({
        userIds: getAdminAndManagerIds(),
        type: "info",
        title: "Document ajouté",
        description: `Le document ${doc.name} a été ajouté.`,
        icon: "info",
        actionUrl: "/admin/documents",
      });

      return { success: true };
    },
    [getAdminAndManagerIds, sendNotifications],
  );

  const uploadDocumentFile = useCallback(
    async ({
      file,
      clientId,
      uploadedBy,
      type,
      bookingId,
      shipmentId,
    }: {
      file: File;
      clientId: string;
      uploadedBy: string;
      type: Document["type"];
      bookingId?: string;
      shipmentId?: string;
    }): Promise<{ success: boolean; error?: string; document?: Document }> => {
      const authResult = await supabase.auth.getUser();
      const authUserId = authResult.data.user?.id;

      if (!authUserId) {
        return {
          success: false,
          error: "Session expirée. Veuillez vous reconnecter.",
        };
      }

      const ownerFolder = clientId || authUserId;
      const filePath = `${ownerFolder}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

      const storageUpload = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (storageUpload.error) {
        const errorMessage =
          storageUpload.error.message || "Erreur de téléversement";
        if (
          errorMessage.toLowerCase().includes("bucket") ||
          errorMessage.toLowerCase().includes("not found")
        ) {
          return {
            success: false,
            error:
              "Bucket 'documents' introuvable côté Supabase. Exécutez le SQL Storage dans supabase/setup.sql.",
          };
        }

        if (
          errorMessage.toLowerCase().includes("row-level security") ||
          errorMessage.toLowerCase().includes("permission") ||
          errorMessage.toLowerCase().includes("unauthorized")
        ) {
          return {
            success: false,
            error:
              "Accès refusé au bucket documents (RLS). Vérifiez les policies Storage dans supabase/setup.sql.",
          };
        }

        return { success: false, error: storageUpload.error.message };
      }

      const createdAt = new Date().toISOString();
      const newDocument: Document = {
        id: `d${Date.now()}`,
        bookingId,
        shipmentId,
        clientId,
        name: file.name,
        type,
        size: formatFileSize(file.size),
        fileUrl: filePath,
        uploadedBy,
        createdAt,
      };

      const insertResult = await addDocument(newDocument);

      if (!insertResult.success) {
        await supabase.storage.from("documents").remove([filePath]);
        return { success: false, error: insertResult.error };
      }

      return { success: true, document: newDocument };
    },
    [addDocument],
  );

  const getDocumentDownloadUrl = useCallback(
    async (
      doc: Document,
    ): Promise<{ success: boolean; error?: string; url?: string }> => {
      if (!doc.fileUrl) {
        return {
          success: false,
          error: "Fichier indisponible pour ce document",
        };
      }

      const signedUrlResult = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.fileUrl, 60 * 5);

      if (signedUrlResult.error) {
        return { success: false, error: signedUrlResult.error.message };
      }

      return { success: true, url: signedUrlResult.data.signedUrl };
    },
    [],
  );

  const addMessage = useCallback(
    async (msg: Message) => {
      const messageInsert = await supabase.from("messages").insert({
        id: msg.id,
        conversation_id: msg.conversationId,
        sender_id: msg.senderId,
        content: msg.content,
        read: msg.read,
        attachment: msg.attachment ?? null,
        created_at: msg.createdAt,
      });

      if (messageInsert.error) {
        console.error("Failed to insert message:", messageInsert.error.message);
        return { success: false, error: messageInsert.error.message };
      }

      const conversationUpdate = await supabase
        .from("conversations")
        .update({
          last_message: msg.content,
          last_message_at: msg.createdAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", msg.conversationId);

      if (conversationUpdate.error) {
        console.error(
          "Failed to update conversation after message insert:",
          conversationUpdate.error.message,
        );
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === msg.conversationId
            ? {
                ...conversation,
                lastMessage: msg.content,
                lastMessageAt: msg.createdAt,
              }
            : conversation,
        ),
      );

      const currentConversation = conversations.find(
        (conversation) => conversation.id === msg.conversationId,
      );

      const recipientIds = new Set<string>();
      if (msg.senderRole === "client") {
        users
          .filter((candidate) => ["admin", "manager"].includes(candidate.role))
          .forEach((candidate) => recipientIds.add(candidate.id));
      } else if (currentConversation?.clientId) {
        recipientIds.add(currentConversation.clientId);
      }

      recipientIds.delete(msg.senderId);

      if (recipientIds.size > 0) {
        const notificationRows = Array.from(recipientIds).map((recipientId) => {
          const recipient = users.find(
            (candidate) => candidate.id === recipientId,
          );
          const actionUrl =
            recipient?.role === "admin"
              ? "/admin/chat"
              : recipient?.role === "manager"
                ? "/manager/chat"
                : "/client/chat";

          return {
            user_id: recipientId,
            type: "message" as NotificationType,
            title: "Nouveau message",
            description: `${msg.senderName} vous a envoyé un message.`,
            read: false,
            icon: "message",
            action_url: actionUrl,
            created_at: msg.createdAt,
          };
        });

        const notificationInsert = await supabase
          .from("notifications")
          .insert(notificationRows)
          .select("*");

        if (!notificationInsert.error) {
          setNotifications((prev) => [
            ...notificationInsert.data.map(toNotification),
            ...prev,
          ]);

          void notifyOfflineClientsByEmail({
            recipientIds: Array.from(recipientIds),
            type: "message",
            title: "Nouveau message",
            description: `${msg.senderName} vous a envoyé un message.`,
            actionUrl: "/client/chat",
          });
        }
      }

      setMessages((prev) => [...prev, msg]);
      return { success: true };
    },
    [conversations, notifyOfflineClientsByEmail, users],
  );

  const updateConversation = useCallback(
    (id: string, data: Partial<Conversation>) => {
      void supabase
        .from("conversations")
        .update({
          client_id: data.clientId,
          last_message: data.lastMessage,
          last_message_at: data.lastMessageAt,
          unread_count: data.unreadCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      );
    },
    [],
  );

  const addConversation = useCallback(async (conv: Conversation) => {
    const insertResult = await supabase.from("conversations").insert({
      id: conv.id,
      client_id: conv.clientId,
      last_message: conv.lastMessage,
      last_message_at: conv.lastMessageAt,
      unread_count: conv.unreadCount,
    });

    if (insertResult.error) {
      console.error(
        "Failed to insert conversation:",
        insertResult.error.message,
      );
      return { success: false, error: insertResult.error.message };
    }

    setConversations((prev) => [...prev, conv]);
    return { success: true };
  }, []);

  const addReclamation = useCallback(
    async (rec: Reclamation): Promise<MutationResult> => {
      const insertResult = await supabase.from("reclamations").insert({
        id: rec.id,
        client_id: rec.clientId,
        booking_ref: rec.bookingRef ?? null,
        subject: rec.subject,
        description: rec.description,
        priority: rec.priority as ReclamationPriority,
        status: rec.status as ReclamationStatus,
        admin_response: rec.adminResponse ?? null,
        created_at: rec.createdAt,
        updated_at: rec.updatedAt,
      });

      if (insertResult.error) {
        return { success: false, error: insertResult.error.message };
      }

      setReclamations((prev) => [...prev, rec]);

      await sendNotifications({
        userIds: [rec.clientId],
        includeAdmins: false,
        type: "info",
        title: "Réclamation soumise",
        description: `Votre réclamation "${rec.subject}" a été enregistrée.`,
        icon: "alert",
        actionUrl: "/client/reclamations",
      });

      const adminTitle = `Nouvelle réclamation client - ${rec.clientName}`;
      const adminDescription = `Le client ${rec.clientName} a soumis une nouvelle réclamation.\n\nObjet: ${rec.subject}\nPriorité: ${rec.priority}\nRéférence commande: ${rec.bookingRef || "Non renseignée"}\nDate: ${new Date(rec.createdAt).toLocaleString("fr-FR")}`;

      await createInAppNotificationsServerSide({
        roles: ["admin", "manager"],
        type: "alert",
        title: adminTitle,
        description: adminDescription,
        icon: "alert",
        actionUrl: "/admin/reclamations",
      });

      void notifyOfflineClientsByEmail({
        recipientIds: [],
        includeAdmins: true,
        type: "alert",
        title: adminTitle,
        description: adminDescription,
        actionUrl: "/admin/reclamations",
      });

      return { success: true };
    },
    [
      createInAppNotificationsServerSide,
      notifyOfflineClientsByEmail,
      sendNotifications,
    ],
  );

  const updateReclamation = useCallback(
    async (id: string, data: Partial<Reclamation>): Promise<MutationResult> => {
      const currentReclamation = reclamations.find(
        (reclamation) => reclamation.id === id,
      );
      const updateResult = await supabase
        .from("reclamations")
        .update({
          client_id: data.clientId,
          booking_ref: data.bookingRef,
          subject: data.subject,
          description: data.description,
          priority: data.priority as ReclamationPriority | undefined,
          status: data.status as ReclamationStatus | undefined,
          admin_response: data.adminResponse,
          updated_at: data.updatedAt ?? new Date().toISOString(),
        })
        .eq("id", id);

      if (updateResult.error) {
        return { success: false, error: updateResult.error.message };
      }

      setReclamations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r)),
      );

      if (currentReclamation) {
        const statusChanged =
          Boolean(data.status) && data.status !== currentReclamation.status;
        const responseAdded =
          Boolean(data.adminResponse) &&
          data.adminResponse !== currentReclamation.adminResponse;

        if (statusChanged || responseAdded) {
          await sendNotifications({
            userIds: [currentReclamation.clientId],
            type: "status_update",
            title: "Réclamation mise à jour",
            description: `${currentReclamation.subject}: statut ${data.status ?? currentReclamation.status}.`,
            icon: "alert",
            actionUrl: "/client/reclamations",
          });

          await sendNotifications({
            userIds: getAdminAndManagerIds(),
            type: "status_update",
            title: "Réclamation traitée",
            description: `${currentReclamation.subject}: statut ${data.status ?? currentReclamation.status}.`,
            icon: "alert",
            actionUrl: "/admin/reclamations",
          });
        }
      }

      return { success: true };
    },
    [getAdminAndManagerIds, reclamations, sendNotifications],
  );

  const addNotification = useCallback(
    async (notif: Notification): Promise<MutationResult> => {
      const insertResult = await supabase.from("notifications").insert({
        id: notif.id,
        user_id: notif.userId,
        type: notif.type as NotificationType,
        title: notif.title,
        description: notif.description,
        read: notif.read,
        icon: notif.icon ?? null,
        action_url: notif.actionUrl ?? null,
        created_at: notif.createdAt,
      });

      if (insertResult.error) {
        return { success: false, error: insertResult.error.message };
      }

      setNotifications((prev) => [...prev, notif]);
      void notifyOfflineClientsByEmail({
        recipientIds: [notif.userId],
        type: notif.type as NotificationType,
        title: notif.title,
        description: notif.description,
        actionUrl: notif.actionUrl,
      });
      return { success: true };
    },
    [notifyOfflineClientsByEmail],
  );

  const updateNotification = useCallback(
    async (
      id: string,
      data: Partial<Notification>,
    ): Promise<MutationResult> => {
      const updateResult = await supabase
        .from("notifications")
        .update({
          user_id: data.userId,
          type: data.type as NotificationType | undefined,
          title: data.title,
          description: data.description,
          read: data.read,
          icon: data.icon,
          action_url: data.actionUrl,
        })
        .eq("id", id);

      if (updateResult.error) {
        return { success: false, error: updateResult.error.message };
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...data } : n)),
      );
      return { success: true };
    },
    [],
  );

  return (
    <StoreContext.Provider
      value={{
        users,
        bookingRequests,
        shipments,
        trackingEvents,
        documents,
        messages,
        conversations,
        reclamations,
        notifications,
        addUser,
        updateUser,
        addBooking,
        updateBooking,
        deleteBooking,
        addShipment,
        updateShipment,
        addTrackingEvent,
        addDocument,
        uploadDocumentFile,
        getDocumentDownloadUrl,
        addMessage,
        updateConversation,
        addConversation,
        addReclamation,
        updateReclamation,
        addNotification,
        updateNotification,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
