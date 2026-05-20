import type { ISODateString, MoneyDTO } from './common';

export type BookingStatusDTO = 'PendingPayment' | 'Paid' | 'Expired' | 'Refunded';
export type TicketStatusDTO = 'active' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';

export interface TicketDTO {
  id: string;
  eventId: string;
  code: string;
  status: TicketStatusDTO;
}

export interface BookingDTO {
  id: string;
  eventId: string;
  customerId: string;
  categoryId: string;
  quantity: number;
  unitPrice: MoneyDTO;
  totalPrice: MoneyDTO;
  paymentDeadline: ISODateString;
  status: BookingStatusDTO;
  tickets: TicketDTO[];
}

// ---- Commands (Requests) ----

export interface CreateBookingRequestDTO {
  eventId: string;
  customerId: string;
  categoryId: string;
  quantity: number;
}

export interface PayBookingRequestDTO {
  bookingId: string;
  amount: MoneyDTO;
}

export interface ExpireBookingRequestDTO {
  bookingId: string;
  now?: ISODateString;
}

export interface CheckInTicketRequestDTO {
  bookingId: string;
  ticketId: string;
  now?: ISODateString;
}
