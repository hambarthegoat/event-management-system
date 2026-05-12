import { AggregateRoot } from "../common/AggregateRoot";
import { Entity } from "../common/Entity";
import { EventCancelled, EventCreated, EventPublished, TicketCategoryCreated, TicketCategoryDisabled } from "../events/Eventevents";
import { InvalidCapacityException, InvalidDateException, InvalidStateException } from "../exceptions/DomainExceptions";
import { Money } from "../value-objects/Money";

export enum EventStatus {
  Draft = 'Draft',
  Published = 'Published',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export enum TicketCategoryStatus {
  Active = "active",
  Disabled = "disabled",
}

interface TicketCategoryProps {
  readonly name: string;
  readonly price: Money;
  readonly quota: number;
  readonly salesStartDate: Date;
  readonly salesEndDate: Date;
}

export class TicketCategory extends Entity<string> {
  private _status: TicketCategoryStatus;

  constructor(
    id: string,
    private readonly _props: TicketCategoryProps,
    status: TicketCategoryStatus = TicketCategoryStatus.Active,
  ) {
    super(id);
    this._status = status;
  }
  get name(): string { return this._props.name; }
  get price(): Money { return this._props.price; }
  get quota(): number { return this._props.quota; }
  get salesStartDate(): Date { return this._props.salesStartDate; }
  get salesEndDate(): Date { return this._props.salesEndDate; }
  get status(): TicketCategoryStatus { return this._status; }
  get isActive(): boolean { return this._status === TicketCategoryStatus.Active; }

  public isSalesOpen(at: Date = new Date()): boolean {
    return this.isActive && at >= this.salesStartDate && at <= this.salesEndDate;
  }

  public disable(): void {
    this._status = TicketCategoryStatus.Disabled;
  }
}


interface EventProps {
  readonly name: string;
  readonly description: string;
  readonly location: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly maxCapacity: number;
  readonly organizerId: string;
}
 
export class Event extends AggregateRoot<string> {
  private _status: EventStatus;
  private readonly _categories: TicketCategory[] = [];
 
  private constructor(
    id: string,
    private readonly _props: EventProps,
    status: EventStatus = EventStatus.Draft,
  ) {
    super(id);
    this._status = status;
  }
 
  get name(): string { return this._props.name; }
  get description(): string { return this._props.description; }
  get location(): string { return this._props.location; }
  get startDate(): Date { return this._props.startDate; }
  get endDate(): Date { return this._props.endDate; }
  get maxCapacity(): number { return this._props.maxCapacity; }
  get organizerId(): string { return this._props.organizerId; }
  get status(): EventStatus { return this._status; }
  get categories(): ReadonlyArray<TicketCategory> { return this._categories; }
 
  public static create(
    id: string,
    name: string,
    description: string,
    location: string,
    startDate: Date,
    endDate: Date,
    maxCapacity: number,
    organizerId: string,
  ): Event {
    if (endDate < startDate) {
      throw new InvalidDateException(
        'Event end date cannot be earlier than start date.',
      );
    }
    if (maxCapacity <= 0) {
      throw new InvalidCapacityException(
        'Event maximum capacity must be greater than zero.',
      );
    }
 
    const event = new Event(id, {
      name,
      description,
      location,
      startDate,
      endDate,
      maxCapacity,
      organizerId,
    });
 
    event.addDomainEvent(new EventCreated(id));
    return event;
  }
 
  // ---- Behaviour ----
 
  /**
   * Adds a ticket category to this event.
   * Raises: TicketCategoryCreated
   *
   * Rules (US-4):
   * - Price cannot be negative (enforced by Money)
   * - Quota must be > 0
   * - Sales end date must be <= event start date
   * - Total quota of all categories must not exceed maxCapacity
   */
  public addTicketCategory(category: TicketCategory): void {
    if (category.quota <= 0) {
      throw new InvalidCapacityException('Ticket category quota must be greater than zero.');
    }
    if (category.salesEndDate > this._props.startDate) {
      throw new InvalidDateException(
        'Ticket sales period must end on or before the event start date.',
      );
    }
 
    const allocatedQuota = this.totalAllocatedQuota + category.quota;
    if (allocatedQuota > this._props.maxCapacity) {
      throw new InvalidCapacityException(
        `Adding this category would exceed the event max capacity. ` +
        `Allocated: ${allocatedQuota}, Max: ${this._props.maxCapacity}.`,
      );
    }
 
    this._categories.push(category);
    this.addDomainEvent(new TicketCategoryCreated(this.id, category.id));
  }
 
  /**
   * Disables a ticket category by id.
   * Raises: TicketCategoryDisabled
   *
   * Rules (US-5):
   * - Event must not be Completed
   */
  public disableTicketCategory(categoryId: string): void {
    if (this._status === EventStatus.Completed) {
      throw new InvalidStateException('Cannot modify categories of a completed event.');
    }
 
    const category = this.findCategoryOrThrow(categoryId);
    category.disable();
    this.addDomainEvent(new TicketCategoryDisabled(this.id, categoryId));
  }
 
  /**
   * Transitions the event from Draft → Published.
   * Raises: EventPublished
   *
   * Rules (US-2):
   * - Must have at least one active ticket category
   * - Cannot publish a Cancelled event
   */
  public publish(): void {
    if (this._status === EventStatus.Cancelled) {
      throw new InvalidStateException('Cannot publish a cancelled event.');
    }
    if (this._status === EventStatus.Completed) {
      throw new InvalidStateException('Cannot publish a completed event.');
    }
    if (!this._categories.some((c) => c.isActive)) {
      throw new InvalidStateException(
        'Event must have at least one active ticket category before publishing.',
      );
    }
 
    this._status = EventStatus.Published;
    this.addDomainEvent(new EventPublished(this.id));
  }
 
  /**
   * Cancels the event.
   * Raises: EventCancelled
   *
   * Rules (US-3):
   * - Cannot cancel a Completed event
   */
  public cancel(): void {
    if (this._status === EventStatus.Completed) {
      throw new InvalidStateException('Cannot cancel a completed event.');
    }
    if (this._status === EventStatus.Cancelled) {
      throw new InvalidStateException('Event is already cancelled.');
    }
 
    this._status = EventStatus.Cancelled;
    this.addDomainEvent(new EventCancelled(this.id));
  }
 
  // ---- Queries ----
 
  /** Returns the category with the lowest price among active categories. */
  public get lowestActivePrice(): Money | null {
    const active = this._categories.filter((c) => c.isActive);
    if (active.length === 0) return null;
    return active.reduce((min, c) =>
      c.price.amount < min.price.amount ? c : min,
    ).price;
  }
 
  public isPublished(): boolean {
    return this._status === EventStatus.Published;
  }
 
  public findCategory(categoryId: string): TicketCategory | undefined {
    return this._categories.find((c) => c.id === categoryId);
  }
 
  // ---- Helpers ----
 
  private get totalAllocatedQuota(): number {
    return this._categories.reduce((sum, c) => sum + c.quota, 0);
  }
 
  private findCategoryOrThrow(categoryId: string): TicketCategory {
    const category = this.findCategory(categoryId);
    if (!category) {
      throw new Error(`Ticket category '${categoryId}' not found in event '${this.id}'.`);
    }
    return category;
  }
}
 