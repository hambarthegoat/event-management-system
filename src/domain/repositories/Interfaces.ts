import { Event } from '../aggregates/Event';
import { Booking } from '../aggregates/Booking';
import type { Refund } from '../aggregates/Refund';

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  save(event: Event): Promise<void>;

  /**
   * Returns all events with status Published.
   * Optionally filtered by location (case-insensitive partial match)
   * and/or date (events whose startDate falls on or after the given date).
   * Used by: US-6 GetPublishedEventsQuery
   */
  findAllPublished(filter?: {
    location?: string;
    date?: string; // ISO date string, filter events on or after this date
  }): Promise<Event[]>;
}

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;

  findActiveByCustomerAndEvent(
    customerId: string,
    eventId: string,
  ): Promise<Booking | null>;

  countActiveByCategory(categoryId: string): Promise<number>;

  save(booking: Booking): Promise<void>;

  /**
   * Returns all bookings belonging to a specific customer.
   * Used by: US-12 GetCustomerTicketsQuery
   */
  findByCustomerId(customerId: string): Promise<Booking[]>;

  /**
   * Returns all bookings for a specific event.
   * Used by: US-19 GetEventSalesReportQuery, US-20 GetEventParticipantsQuery
   */
  findByEventId(eventId: string): Promise<Booking[]>;
}

export interface IRefundRepository {
  findById(id: string): Promise<Refund | null>;
  save(refund: Refund): Promise<void>;
}