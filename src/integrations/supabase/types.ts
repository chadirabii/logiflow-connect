export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          cargo_type: string;
          client_id: string;
          company: string | null;
          container_type: string | null;
          created_at: string;
          destination_country: string;
          destination_port: string;
          email: string | null;
          full_name: string;
          id: string;
          incoterm: string | null;
          origin_country: string;
          origin_port: string;
          phone: string | null;
          reference_number: string;
          requested_date: string | null;
          shipment_mode: string | null;
          special_instructions: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          updated_at: string;
          volume: number;
          weight: number;
        };
        Insert: {
          cargo_type: string;
          client_id: string;
          company?: string | null;
          container_type?: string | null;
          created_at?: string;
          destination_country: string;
          destination_port: string;
          email?: string | null;
          full_name: string;
          id?: string;
          incoterm?: string | null;
          origin_country: string;
          origin_port: string;
          phone?: string | null;
          reference_number: string;
          requested_date?: string | null;
          shipment_mode?: string | null;
          special_instructions?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
          volume?: number;
          weight?: number;
        };
        Update: {
          cargo_type?: string;
          client_id?: string;
          company?: string | null;
          container_type?: string | null;
          created_at?: string;
          destination_country?: string;
          destination_port?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          incoterm?: string | null;
          origin_country?: string;
          origin_port?: string;
          phone?: string | null;
          reference_number?: string;
          requested_date?: string | null;
          shipment_mode?: string | null;
          special_instructions?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
          volume?: number;
          weight?: number;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          client_id: string;
          created_at: string;
          id: string;
          last_message: string | null;
          last_message_at: string | null;
          unread_count: number;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          id?: string;
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          id?: string;
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          booking_id: string | null;
          client_id: string;
          created_at: string;
          file_url: string | null;
          id: string;
          name: string;
          shipment_id: string | null;
          size: string | null;
          type: Database["public"]["Enums"]["document_type"];
          uploaded_by: string | null;
        };
        Insert: {
          booking_id?: string | null;
          client_id: string;
          created_at?: string;
          file_url?: string | null;
          id?: string;
          name: string;
          shipment_id?: string | null;
          size?: string | null;
          type?: Database["public"]["Enums"]["document_type"];
          uploaded_by?: string | null;
        };
        Update: {
          booking_id?: string | null;
          client_id?: string;
          created_at?: string;
          file_url?: string | null;
          id?: string;
          name?: string;
          shipment_id?: string | null;
          size?: string | null;
          type?: Database["public"]["Enums"]["document_type"];
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          attachment: string | null;
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          read: boolean;
          sender_id: string | null;
        };
        Insert: {
          attachment?: string | null;
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          read?: boolean;
          sender_id?: string | null;
        };
        Update: {
          attachment?: string | null;
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          read?: boolean;
          sender_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          action_url: string | null;
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          read: boolean;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          action_url?: string | null;
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          read?: boolean;
          title: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          action_url?: string | null;
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          read?: boolean;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          company: string | null;
          created_at: string;
          full_name: string;
          id: string;
          last_seen_at: string;
          patente_file: string | null;
          phone: string | null;
          rne_file: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          full_name: string;
          id?: string;
          last_seen_at?: string;
          patente_file?: string | null;
          phone?: string | null;
          rne_file?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          last_seen_at?: string;
          patente_file?: string | null;
          phone?: string | null;
          rne_file?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reclamations: {
        Row: {
          admin_response: string | null;
          booking_ref: string | null;
          client_id: string;
          created_at: string;
          description: string;
          id: string;
          priority: Database["public"]["Enums"]["reclamation_priority"];
          status: Database["public"]["Enums"]["reclamation_status"];
          subject: string;
          updated_at: string;
        };
        Insert: {
          admin_response?: string | null;
          booking_ref?: string | null;
          client_id: string;
          created_at?: string;
          description: string;
          id?: string;
          priority?: Database["public"]["Enums"]["reclamation_priority"];
          status?: Database["public"]["Enums"]["reclamation_status"];
          subject: string;
          updated_at?: string;
        };
        Update: {
          admin_response?: string | null;
          booking_ref?: string | null;
          client_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          priority?: Database["public"]["Enums"]["reclamation_priority"];
          status?: Database["public"]["Enums"]["reclamation_status"];
          subject?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipments: {
        Row: {
          booking_id: string;
          client_id: string;
          container_number: string | null;
          created_at: string;
          current_location: string | null;
          current_port: string | null;
          destination_port: string;
          estimated_arrival: string | null;
          id: string;
          origin_port: string;
          reference_number: string;
          status: Database["public"]["Enums"]["booking_status"];
          updated_at: string;
          vessel: string | null;
        };
        Insert: {
          booking_id: string;
          client_id: string;
          container_number?: string | null;
          created_at?: string;
          current_location?: string | null;
          current_port?: string | null;
          destination_port: string;
          estimated_arrival?: string | null;
          id?: string;
          origin_port: string;
          reference_number: string;
          status?: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
          vessel?: string | null;
        };
        Update: {
          booking_id?: string;
          client_id?: string;
          container_number?: string | null;
          created_at?: string;
          current_location?: string | null;
          current_port?: string | null;
          destination_port?: string;
          estimated_arrival?: string | null;
          id?: string;
          origin_port?: string;
          reference_number?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          updated_at?: string;
          vessel?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shipments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      tracking_events: {
        Row: {
          description: string;
          id: string;
          location: string;
          port: string | null;
          shipment_id: string;
          status: Database["public"]["Enums"]["booking_status"];
          timestamp: string;
        };
        Insert: {
          description: string;
          id?: string;
          location: string;
          port?: string | null;
          shipment_id: string;
          status: Database["public"]["Enums"]["booking_status"];
          timestamp?: string;
        };
        Update: {
          description?: string;
          id?: string;
          location?: string;
          port?: string | null;
          shipment_id?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracking_events_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "client" | "manager";
      booking_status:
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "confirmed"
        | "in_transit"
        | "arrived_port"
        | "customs"
        | "delivering"
        | "delivered";
      document_type:
        | "invoice"
        | "packing_list"
        | "customs"
        | "transport"
        | "contract"
        | "other";
      notification_type:
        | "message"
        | "status_update"
        | "alert"
        | "success"
        | "info";
      reclamation_priority: "low" | "medium" | "high";
      reclamation_status: "open" | "in_progress" | "resolved" | "closed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client", "manager"],
      booking_status: [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "confirmed",
        "in_transit",
        "arrived_port",
        "customs",
        "delivering",
        "delivered",
      ],
      document_type: [
        "invoice",
        "packing_list",
        "customs",
        "transport",
        "contract",
        "other",
      ],
      notification_type: [
        "message",
        "status_update",
        "alert",
        "success",
        "info",
      ],
      reclamation_priority: ["low", "medium", "high"],
      reclamation_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const;
