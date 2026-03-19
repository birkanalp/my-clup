/**
 * Generated Supabase database types.
 *
 * This file is the canonical location for output from:
 *   supabase gen types typescript --project-id <id> > src/generated/database.types.ts
 *
 * Manually aligned with migrations in supabase/migrations/ (Task 15.1, Task 17.1).
 * Regenerate with `supabase gen types` when linked to a live project.
 *
 * See packages/supabase/README.md for type generation instructions.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole =
  | 'platform_admin'
  | 'platform_support'
  | 'platform_finance'
  | 'gym_owner'
  | 'gym_manager'
  | 'gym_staff'
  | 'gym_instructor'
  | 'gym_receptionist'
  | 'gym_sales'
  | 'branch_manager'
  | 'branch_instructor'
  | 'branch_staff';

export type ConversationType =
  | 'direct'
  | 'support'
  | 'instructor'
  | 'group'
  | 'broadcast'
  | 'internal_staff';

export type MembershipPlanType = 'time_based' | 'session_based' | 'personal_training';
export type MembershipPlanStatus = 'active' | 'inactive';
export type MembershipStatus = 'active' | 'frozen' | 'cancelled' | 'expired';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'overdue';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online';
export type ReceivableStatus = 'open' | 'partial' | 'settled' | 'overdue';
export type InstallmentStatus = 'active' | 'completed' | 'defaulted';

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      branches: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          display_name: string;
          avatar_url: string | null;
          locale: string;
          fallback_locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string;
          avatar_url?: string | null;
          locale?: string;
          fallback_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          avatar_url?: string | null;
          locale?: string;
          fallback_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_role_assignments: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          gym_id: string | null;
          branch_id: string | null;
          granted_at: string;
          granted_by: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: AppRole;
          gym_id?: string | null;
          branch_id?: string | null;
          granted_at?: string;
          granted_by: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AppRole;
          gym_id?: string | null;
          branch_id?: string | null;
          granted_at?: string;
          granted_by?: string;
        };
        Relationships: [];
      };
      gym_staff: {
        Row: {
          user_id: string;
          gym_id: string;
          branch_id: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          gym_id: string;
          branch_id?: string | null;
          role: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          gym_id?: string;
          branch_id?: string | null;
          role?: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          event_type: string;
          actor_id: string | null;
          target_type: string;
          target_id: string | null;
          payload: Json;
          tenant_context: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          actor_id?: string | null;
          target_type: string;
          target_id?: string | null;
          payload?: Json;
          tenant_context?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          actor_id?: string | null;
          target_type?: string;
          target_id?: string | null;
          payload?: Json;
          tenant_context?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      membership_plans: {
        Row: {
          id: string;
          gym_id: string;
          branch_id: string | null;
          name: string;
          type: MembershipPlanType;
          status: MembershipPlanStatus;
          duration_days: number | null;
          session_count: number | null;
          freeze_rule: Json;
          branch_restriction_enabled: boolean;
          allowed_branch_ids: string[];
          pricing_tiers: Json;
          discount_rules: Json;
          trial_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          branch_id?: string | null;
          name: string;
          type: MembershipPlanType;
          status?: MembershipPlanStatus;
          duration_days?: number | null;
          session_count?: number | null;
          freeze_rule?: Json;
          branch_restriction_enabled?: boolean;
          allowed_branch_ids?: string[];
          pricing_tiers?: Json;
          discount_rules?: Json;
          trial_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          branch_id?: string | null;
          name?: string;
          type?: MembershipPlanType;
          status?: MembershipPlanStatus;
          duration_days?: number | null;
          session_count?: number | null;
          freeze_rule?: Json;
          branch_restriction_enabled?: boolean;
          allowed_branch_ids?: string[];
          pricing_tiers?: Json;
          discount_rules?: Json;
          trial_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      membership_instances: {
        Row: {
          id: string;
          plan_id: string;
          member_id: string;
          gym_id: string;
          branch_id: string | null;
          status: MembershipStatus;
          valid_from: string;
          valid_until: string | null;
          remaining_sessions: number | null;
          entitled_branch_ids: string[];
          freeze_start_at: string | null;
          freeze_end_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          member_id: string;
          gym_id: string;
          branch_id?: string | null;
          status?: MembershipStatus;
          valid_from: string;
          valid_until?: string | null;
          remaining_sessions?: number | null;
          entitled_branch_ids?: string[];
          freeze_start_at?: string | null;
          freeze_end_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          member_id?: string;
          gym_id?: string;
          branch_id?: string | null;
          status?: MembershipStatus;
          valid_from?: string;
          valid_until?: string | null;
          remaining_sessions?: number | null;
          entitled_branch_ids?: string[];
          freeze_start_at?: string | null;
          freeze_end_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          gym_id: string;
          branch_id: string | null;
          member_id: string;
          membership_instance_id: string | null;
          status: InvoiceStatus;
          currency: string;
          subtotal_amount: number;
          discount_amount: number;
          total_amount: number;
          due_at: string;
          issued_at: string;
          paid_at: string | null;
          line_items: Json;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          branch_id?: string | null;
          member_id: string;
          membership_instance_id?: string | null;
          status?: InvoiceStatus;
          currency: string;
          subtotal_amount: number;
          discount_amount?: number;
          total_amount: number;
          due_at: string;
          issued_at?: string;
          paid_at?: string | null;
          line_items?: Json;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          branch_id?: string | null;
          member_id?: string;
          membership_instance_id?: string | null;
          status?: InvoiceStatus;
          currency?: string;
          subtotal_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          due_at?: string;
          issued_at?: string;
          paid_at?: string | null;
          line_items?: Json;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          gym_id: string;
          branch_id: string | null;
          member_id: string;
          invoice_id: string | null;
          currency: string;
          amount: number;
          method: PaymentMethod;
          status: PaymentStatus;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          branch_id?: string | null;
          member_id: string;
          invoice_id?: string | null;
          currency: string;
          amount: number;
          method: PaymentMethod;
          status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          branch_id?: string | null;
          member_id?: string;
          invoice_id?: string | null;
          currency?: string;
          amount?: number;
          method?: PaymentMethod;
          status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      receivables: {
        Row: {
          id: string;
          gym_id: string;
          branch_id: string | null;
          member_id: string;
          invoice_id: string | null;
          currency: string;
          amount_due: number;
          amount_paid: number;
          due_at: string;
          status: ReceivableStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          branch_id?: string | null;
          member_id: string;
          invoice_id?: string | null;
          currency: string;
          amount_due: number;
          amount_paid?: number;
          due_at: string;
          status?: ReceivableStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          branch_id?: string | null;
          member_id?: string;
          invoice_id?: string | null;
          currency?: string;
          amount_due?: number;
          amount_paid?: number;
          due_at?: string;
          status?: ReceivableStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      installment_plans: {
        Row: {
          id: string;
          gym_id: string;
          branch_id: string | null;
          member_id: string;
          invoice_id: string | null;
          total_amount: number;
          installment_count: number;
          remaining_installments: number;
          next_due_at: string | null;
          status: InstallmentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          branch_id?: string | null;
          member_id: string;
          invoice_id?: string | null;
          total_amount: number;
          installment_count: number;
          remaining_installments: number;
          next_due_at?: string | null;
          status?: InstallmentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          branch_id?: string | null;
          member_id?: string;
          invoice_id?: string | null;
          total_amount?: number;
          installment_count?: number;
          remaining_installments?: number;
          next_due_at?: string | null;
          status?: InstallmentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      discount_codes: {
        Row: {
          id: string;
          gym_id: string;
          branch_id: string | null;
          code: string;
          type: 'percentage' | 'fixed';
          value: number;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          branch_id?: string | null;
          code: string;
          type: 'percentage' | 'fixed';
          value: number;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          branch_id?: string | null;
          code?: string;
          type?: 'percentage' | 'fixed';
          value?: number;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_reminders: {
        Row: {
          id: string;
          gym_id: string;
          branch_id: string | null;
          member_id: string;
          receivable_id: string | null;
          channel: 'sms' | 'email' | 'push' | 'whatsapp';
          locale: 'tr' | 'en';
          status: 'queued' | 'sent' | 'failed';
          scheduled_at: string;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          branch_id?: string | null;
          member_id: string;
          receivable_id?: string | null;
          channel: 'sms' | 'email' | 'push' | 'whatsapp';
          locale: 'tr' | 'en';
          status?: 'queued' | 'sent' | 'failed';
          scheduled_at: string;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          branch_id?: string | null;
          member_id?: string;
          receivable_id?: string | null;
          channel?: 'sms' | 'email' | 'push' | 'whatsapp';
          locale?: 'tr' | 'en';
          status?: 'queued' | 'sent' | 'failed';
          scheduled_at?: string;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          gym_id: string;
          branch_id: string | null;
          type: ConversationType;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          branch_id?: string | null;
          type: ConversationType;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          branch_id?: string | null;
          type?: ConversationType;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          dedupe_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string;
          dedupe_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          dedupe_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      message_attachments: {
        Row: {
          id: string;
          message_id: string;
          storage_path: string;
          mime_type: string | null;
          filename: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          storage_path: string;
          mime_type?: string | null;
          filename?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          storage_path?: string;
          mime_type?: string | null;
          filename?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      message_receipts: {
        Row: {
          message_id: string;
          participant_id: string;
          read_at: string;
        };
        Insert: {
          message_id: string;
          participant_id: string;
          read_at?: string;
        };
        Update: {
          message_id?: string;
          participant_id?: string;
          read_at?: string;
        };
        Relationships: [];
      };
      conversation_assignments: {
        Row: {
          id: string;
          conversation_id: string;
          assigned_to_user_id: string;
          assigned_at: string;
          assigned_by_user_id: string | null;
          unassigned_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          assigned_to_user_id: string;
          assigned_at?: string;
          assigned_by_user_id?: string | null;
          unassigned_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          assigned_to_user_id?: string;
          assigned_at?: string;
          assigned_by_user_id?: string | null;
          unassigned_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      conversation_type: ConversationType;
      invoice_status: InvoiceStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      receivable_status: ReceivableStatus;
      installment_status: InstallmentStatus;
    };
  };
}
