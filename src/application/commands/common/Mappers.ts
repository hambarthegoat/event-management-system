import type {
  BookingDTO,
  EventDTO,
  MoneyDTO,
  RefundDTO,
  TicketCategoryDTO,
  TicketDTO,
} from '../../dtos';
import type { Booking } from '../../../domain/aggregates/Booking';
import type { Event, TicketCategory } from '../../../domain/aggregates/Event';
import type { Refund } from '../../../domain/aggregates/Refund';
import type { Money } from '../../../domain/value-objects/Money';
import { toISODateString } from './DateUtils';

export function toMoneyDTO(money: Money): MoneyDTO {
  return { amount: money.amount, currency: money.currency };
}

export function toTicketCategoryDTO(category: TicketCategory): TicketCategoryDTO {
  return {
    id: category.id,
    name: category.name,
    price: toMoneyDTO(category.price),
    quota: category.quota,
    salesStartDate: toISODateString(category.salesStartDate),
    salesEndDate: toISODateString(category.salesEndDate),
    status: category.status,
  };
}

export function toEventDTO(event: Event): EventDTO {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    startDate: toISODateString(event.startDate),
    endDate: toISODateString(event.endDate),
    maxCapacity: event.maxCapacity,
    organizerId: event.organizerId,
    status: event.status,
    categories: event.categories.map(toTicketCategoryDTO),
  };
}

export function toTicketDTO(ticket: Booking['tickets'][number]): TicketDTO {
  return {
    id: ticket.id,
    eventId: ticket.eventId,
    code: ticket.code.value,
    status: ticket.status,
  };
}

export function toBookingDTO(booking: Booking): BookingDTO {
  return {
    id: booking.id,
    eventId: booking.eventId,
    customerId: booking.customerId,
    categoryId: booking.categoryId,
    quantity: booking.quantity,
    unitPrice: toMoneyDTO(booking.unitPrice),
    totalPrice: toMoneyDTO(booking.totalPrice),
    paymentDeadline: toISODateString(booking.paymentDeadline),
    status: booking.status,
    tickets: booking.tickets.map(toTicketDTO),
  };
}

export function toRefundDTO(refund: Refund): RefundDTO {
  return {
    id: refund.id,
    bookingId: refund.bookingId,
    amount: toMoneyDTO(refund.amount),
    status: refund.status,
    rejectionReason: refund.rejectionReason,
    paymentReference: refund.paymentReference,
  };
}
