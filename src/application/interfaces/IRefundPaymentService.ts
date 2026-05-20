import type { ISODateString, MoneyDTO } from '../dtos/common';

export interface RefundPayoutRequestDTO {
  refundId: string;
  bookingId: string;
  customerId: string;
  amount: MoneyDTO;
}

export interface RefundPayoutResultDTO {
  payoutReference: string;
  paidOutAt: ISODateString;
}

/**
 * - External System: Refund Payment Service / Bank Service
 * - User Story: US-18 Mark Refund as Paid Out (trigger payout and record reference)
 */
export interface IRefundPaymentService {
  payout(request: RefundPayoutRequestDTO): Promise<RefundPayoutResultDTO>;
}
