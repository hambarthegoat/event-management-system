import { Event } from '../aggregates/Event';
import { Booking } from '../aggregates/Booking';

export interface IEventRepository {
  findById(id: string): Promise<Event| null>;
  save(event: Event): Promise<void>;
}

export interface IBookingRepository {
  findById(id: string): Promise<Booking| null>;

  findActiveByCustomerAndEvent(
    customerId: string,
    eventId: string,
  ): Promise<Booking | null>;

  countActiveByCategory(categoryId: string): Promise<number>;

  save(booking: Booking): Promise<void>;
}