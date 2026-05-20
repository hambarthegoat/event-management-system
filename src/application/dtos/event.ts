import type { ISODateString, MoneyDTO } from './common';

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
