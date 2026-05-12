import type { DomainEvent } from "../common/DomainEvent";

export class TicketReserved implements DomainEvent{
  readonly occurredOn: Date = new Date();
  constructor(public readonly bookingId: string) {}
}

export class BookingPaid implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(public readonly bookingId: string) {}
}

export class BookingExpired implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(public readonly bookingId: string) {}
}

export class TicketCheckedIn implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(
    public readonly bookingId: string,
    public readonly ticketId: string,
  ) {}
}