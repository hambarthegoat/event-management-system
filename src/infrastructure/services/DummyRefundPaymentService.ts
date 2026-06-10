import type {
  IRefundPaymentService,
  RefundPayoutRequestDTO,
  RefundPayoutResultDTO,
} from '../../application/interfaces/IRefundPaymentService';
import { randomUUID } from 'crypto';

export class DummyRefundPaymentService implements IRefundPaymentService {
  async payout(
    _request: RefundPayoutRequestDTO,
  ): Promise<RefundPayoutResultDTO> {
    return {
      payoutReference: `refund-${randomUUID()}`,
      paidOutAt: new Date().toISOString(),
    };
  }
}
