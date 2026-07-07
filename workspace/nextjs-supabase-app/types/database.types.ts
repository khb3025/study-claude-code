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
      admin_users: {
        Row: {
          granted_at: string;
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          user_id: string;
        };
        Update: {
          granted_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      blacklists: {
        Row: {
          blocked_organizer_id: string;
          blocker_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          blocked_organizer_id: string;
          blocker_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          blocked_organizer_id?: string;
          blocker_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      carpool_passengers: {
        Row: {
          carpool_id: string;
          id: string;
          initiated_by: string;
          passenger_id: string;
          status: string;
        };
        Insert: {
          carpool_id: string;
          id?: string;
          initiated_by: string;
          passenger_id: string;
          status?: string;
        };
        Update: {
          carpool_id?: string;
          id?: string;
          initiated_by?: string;
          passenger_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "carpool_passengers_carpool_id_fkey";
            columns: ["carpool_id"];
            isOneToOne: false;
            referencedRelation: "carpools";
            referencedColumns: ["id"];
          },
        ];
      };
      carpools: {
        Row: {
          departure_point: string | null;
          departure_time: string | null;
          driver_id: string;
          event_id: string;
          id: string;
          seats_total: number;
        };
        Insert: {
          departure_point?: string | null;
          departure_time?: string | null;
          driver_id: string;
          event_id: string;
          id?: string;
          seats_total: number;
        };
        Update: {
          departure_point?: string | null;
          departure_time?: string | null;
          driver_id?: string;
          event_id?: string;
          id?: string;
          seats_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "carpools_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          capacity: number;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          items_to_bring: string | null;
          join_type: string;
          location: string | null;
          organizer_carpool_visible: boolean;
          organizer_id: string;
          participation_fee_amount: number | null;
          participation_fee_enabled: boolean;
          password_hash: string | null;
          recurrence_day_of_month: number | null;
          recurrence_time: string | null;
          recurrence_type: string;
          recurrence_week_of_month: number | null;
          recurrence_weekday: number | null;
          schedule: string | null;
          settlement_visible: boolean;
          starts_at: string;
          status: string;
          title: string;
        };
        Insert: {
          capacity: number;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          items_to_bring?: string | null;
          join_type?: string;
          location?: string | null;
          organizer_carpool_visible?: boolean;
          organizer_id: string;
          participation_fee_amount?: number | null;
          participation_fee_enabled?: boolean;
          password_hash?: string | null;
          recurrence_day_of_month?: number | null;
          recurrence_time?: string | null;
          recurrence_type?: string;
          recurrence_week_of_month?: number | null;
          recurrence_weekday?: number | null;
          schedule?: string | null;
          settlement_visible?: boolean;
          starts_at: string;
          status?: string;
          title: string;
        };
        Update: {
          capacity?: number;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          items_to_bring?: string | null;
          join_type?: string;
          location?: string | null;
          organizer_carpool_visible?: boolean;
          organizer_id?: string;
          participation_fee_amount?: number | null;
          participation_fee_enabled?: boolean;
          password_hash?: string | null;
          recurrence_day_of_month?: number | null;
          recurrence_time?: string | null;
          recurrence_type?: string;
          recurrence_week_of_month?: number | null;
          recurrence_weekday?: number | null;
          schedule?: string | null;
          settlement_visible?: boolean;
          starts_at?: string;
          status?: string;
          title?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          created_at: string;
          friend_id: string;
          id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          friend_id: string;
          id?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          friend_id?: string;
          id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          created_at: string;
          event_id: string;
          id: string;
          invitee_email: string;
          invitee_id: string | null;
          inviter_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          id?: string;
          invitee_email: string;
          invitee_id?: string | null;
          inviter_id: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          id?: string;
          invitee_email?: string;
          invitee_id?: string | null;
          inviter_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      participants: {
        Row: {
          event_id: string;
          id: string;
          joined_at: string;
          kick_reason: string | null;
          kick_reason_visible: boolean;
          kicked_at: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          event_id: string;
          id?: string;
          joined_at?: string;
          kick_reason?: string | null;
          kick_reason_visible?: boolean;
          kicked_at?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          event_id?: string;
          id?: string;
          joined_at?: string;
          kick_reason?: string | null;
          kick_reason_visible?: boolean;
          kicked_at?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "participants_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          name_visible: boolean;
          nickname: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          name_visible?: boolean;
          nickname?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          name_visible?: boolean;
          nickname?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      settlement_shares: {
        Row: {
          amount: number;
          id: string;
          is_paid: boolean;
          paid_at: string | null;
          settlement_id: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          id?: string;
          is_paid?: boolean;
          paid_at?: string | null;
          settlement_id: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          id?: string;
          is_paid?: boolean;
          paid_at?: string | null;
          settlement_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "settlement_shares_settlement_id_fkey";
            columns: ["settlement_id"];
            isOneToOne: false;
            referencedRelation: "settlements";
            referencedColumns: ["id"];
          },
        ];
      };
      settlements: {
        Row: {
          created_by: string;
          event_id: string;
          id: string;
          title: string;
          total_amount: number;
        };
        Insert: {
          created_by: string;
          event_id: string;
          id?: string;
          title: string;
          total_amount: number;
        };
        Update: {
          created_by?: string;
          event_id?: string;
          id?: string;
          title?: string;
          total_amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: "settlements_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      participants_view: {
        Row: {
          event_id: string | null;
          id: string | null;
          joined_at: string | null;
          kick_reason: string | null;
          kick_reason_visible: boolean | null;
          kicked_at: string | null;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          event_id?: string | null;
          id?: string | null;
          joined_at?: string | null;
          kick_reason?: never;
          kick_reason_visible?: boolean | null;
          kicked_at?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          event_id?: string | null;
          id?: string | null;
          joined_at?: string | null;
          kick_reason?: never;
          kick_reason_visible?: boolean | null;
          kicked_at?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "participants_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      accept_invitation: {
        Args: { p_invitation_id: string };
        Returns: undefined;
      };
      approve_participant: {
        Args: { p_participant_id: string };
        Returns: {
          event_id: string;
          id: string;
          joined_at: string;
          kick_reason: string | null;
          kick_reason_visible: boolean;
          kicked_at: string | null;
          status: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "participants";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      cancel_participation: {
        Args: { p_participant_id: string };
        Returns: undefined;
      };
      create_settlement: {
        Args: {
          p_event_id: string;
          p_include_organizer?: boolean;
          p_title: string;
          p_total_amount: number;
        };
        Returns: string;
      };
      get_event_organizer_contact: {
        Args: { p_event_id: string };
        Returns: {
          email: string;
          name: string;
        }[];
      };
      invite_passenger: {
        Args: { p_carpool_id: string; p_participant_user_id: string };
        Returns: {
          carpool_id: string;
          id: string;
          initiated_by: string;
          passenger_id: string;
          status: string;
        };
        SetofOptions: {
          from: "*";
          to: "carpool_passengers";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      join_event: {
        Args: { p_event_id: string };
        Returns: {
          event_id: string;
          id: string;
          joined_at: string;
          kick_reason: string | null;
          kick_reason_visible: boolean;
          kicked_at: string | null;
          status: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "participants";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      register_carpool: {
        Args: {
          p_departure_point?: string;
          p_departure_time?: string;
          p_event_id: string;
          p_force?: boolean;
          p_seats_total: number;
        };
        Returns: Json;
      };
      request_carpool: {
        Args: { p_carpool_id: string };
        Returns: {
          carpool_id: string;
          id: string;
          initiated_by: string;
          passenger_id: string;
          status: string;
        };
        SetofOptions: {
          from: "*";
          to: "carpool_passengers";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      respond_carpool_passenger: {
        Args: { p_accept: boolean; p_carpool_passenger_id: string };
        Returns: {
          carpool_id: string;
          id: string;
          initiated_by: string;
          passenger_id: string;
          status: string;
        };
        SetofOptions: {
          from: "*";
          to: "carpool_passengers";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      [_ in never]: never;
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
