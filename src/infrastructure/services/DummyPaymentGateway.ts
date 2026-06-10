import type {
  IPaymentGateway,
  PaymentChargeRequestDTO,
  PaymentChargeResultDTO,
} from '../../application/interfaces/IPaymentGateway';
import { randomUUID } from 'crypto';

export class DummyPaymentGateway implements IPaymentGateway {
  async charge(
    _request: PaymentChargeRequestDTO,
  ): Promise<PaymentChargeResultDTO> {
    return {
      paymentReference: `pay-${randomUUID()}`,
      paidAt: new Date().toISOString(),
    };
  }
}
