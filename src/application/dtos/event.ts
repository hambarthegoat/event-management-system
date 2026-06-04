import type { ISODateString, MoneyDTO } from './common';
import type { TicketStatusDTO } from './booking';

export type EventStatusDTO = 'Draft' | 'Published' | 'Cancelled' | 'Completed';
export type TicketCategoryStatusDTO = 'active' | 'disabled';

export interface TicketCategoryDTO {
  id: string;
  name: string;
  price: MoneyDTO;
  quota: number;
  salesStartDate: ISODateString;
  salesEndDate: ISODateString;
  status: TicketCategoryStatusDTO;
}

export interface EventDTO {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: ISODateString;
  endDate: ISODateString;
  maxCapacity: number;
  organizerId: string;
  status: EventStatusDTO;
  categories: TicketCategoryDTO[];
}

export interface EventListItemDTO {
  id: string;
  name: string;
  startDate: ISODateString;
  endDate: ISODateString;
  location: string;
  lowestActivePrice: MoneyDTO | null;
}

// ---- Commands (Requests) ----

export interface CreateEventRequestDTO {
  name: string;
  description: string;
  location: string;
  startDate: ISODateString;
  endDate: ISODateString;
  maxCapacity: number;
  organizerId: string;
}

export interface PublishEventRequestDTO {
  eventId: string;
}

export interface CancelEventRequestDTO {
  eventId: string;
}

export interface CreateTicketCategoryRequestDTO {
  eventId: string;
  name: string;
  price: MoneyDTO;
  quota: number;
  salesStartDate: ISODateString;
  salesEndDate: ISODateString;
}

export interface DisableTicketCategoryRequestDTO {
  eventId: string;
  categoryId: string;
}

// ---- Query Requests ----

/** US-6: filter params for listing published events */
export interface GetPublishedEventsRequestDTO {
  location?: string;
  date?: string; // ISO date string — filter events on or after this date
}

/** US-7: get single event detail */
export interface GetEventDetailRequestDTO {
  eventId: string;
}

/** US-19: sales report for an event */
export interface GetEventSalesReportRequestDTO {
  eventId: string;
}

/** US-20: participant list for an event */
export interface GetEventParticipantsRequestDTO {
  eventId: string;
}

// ---- Query Responses ----

/** US-19: ticket sales breakdown per category */
export interface TicketCategorySalesDTO {
  categoryId: string;
  categoryName: string;
  ticketsSold: number;
}

/** US-19: full sales report */
export interface EventSalesReportDTO {
  eventId: string;
  categorySales: TicketCategorySalesDTO[];
  bookingCountByStatus: {
    PendingPayment: number;
    Paid: number;
    Expired: number;
    Refunded: number;
  };
  totalRevenue: MoneyDTO;
}

/** US-20: single participant entry */
export interface EventParticipantDTO {
  customerId: string;
  ticketCategoryName: string;
  ticketCode: string;
  ticketStatus: TicketStatusDTO;
}
