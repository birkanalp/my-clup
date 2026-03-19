import type { Invoice, MembershipInstance, MembershipPlan, Payment } from '@myclup/api-client';
import type { SupportedLocale } from '@myclup/types';

export type RenewalReason = 'expired' | 'expiring_soon' | null;

export interface MembershipScreenData {
  locale: SupportedLocale;
  memberId: string | null;
  membership: MembershipInstance | null;
  plan: MembershipPlan | null;
  renewalOptions: MembershipPlan[];
  canRenew: boolean;
  renewalReason: RenewalReason;
}

export interface PaymentHistoryItem {
  payment: Payment;
  invoice: Invoice | null;
}

export interface RenewalSubmissionResult {
  membership: MembershipInstance;
  plan: MembershipPlan;
  renewedUntil: string;
  addedSessions: number | null;
}
