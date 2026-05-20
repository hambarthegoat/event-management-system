import type { ISODateString, MoneyDTO } from '../dtos/common';

export interface PaymentChargeRequestDTO {
  bookingId: string;
  customerId: string;
  amount: MoneyDTO;
}

export interface PaymentChargeResultDTO {
  paymentReference: string;
  paidAt: ISODateString;
}

/**
 * - External System: Payment Gateway
 * - User Story: US-10 Pay Booking (process booking payment)
 */
export interface IPaymentGateway {
  charge(request: PaymentChargeRequestDTO): Promise<PaymentChargeResultDTO>;
}
