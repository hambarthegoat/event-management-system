import type { MoneyDTO } from './common';

export type RefundStatusDTO = 'Requested' | 'Approved' | 'Rejected' | 'PaidOut';

export interface RefundDTO {
  id: string;
  bookingId: string;
  amount: MoneyDTO;
  status: RefundStatusDTO;
  rejectionReason?: string;
  paymentReference?: string;
}

// ---- Commands (Requests) ----

export interface RequestRefundRequestDTO {
  bookingId: string;
}

export interface ApproveRefundRequestDTO {
  refundId: string;
}

export interface RejectRefundRequestDTO {
  refundId: string;
  reason: string;
}

export interface MarkRefundPaidOutRequestDTO {
  refundId: string;
  paymentReference: string;
}
