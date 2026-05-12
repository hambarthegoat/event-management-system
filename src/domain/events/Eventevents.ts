import type { DomainEvent } from "../common/DomainEvent";

export class EventCreated implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(public readonly eventId: string) {}
}
 
export class EventPublished implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(public readonly eventId: string) {}
}
 
export class EventCancelled implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(public readonly eventId: string) {}
}
export class TicketCategoryCreated implements DomainEvent {
  readonly occurredOn: Date = new Date();

  constructor(
    public readonly eventId: string,
    public readonly categoryId: string
  ) {}
}

export class TicketCategoryDisabled implements DomainEvent {
  readonly occurredOn: Date = new Date();

  constructor(
    public readonly eventId: string,
    public readonly categoryId: string
  ) {}
}