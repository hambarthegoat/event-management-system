import { AggregateRoot } from "../common/AggregateRoot";
import { Entity } from "../common/Entity";
import { BookingExpired, BookingPaid, TicketCheckedIn, TicketReserved } from "../events/Bookingevents";
import {
  InvalidCapacityException,
  InvalidDateException,
  InvalidPaymentException,
  InvalidQuantityException,
  InvalidStateException
} from "../exceptions/DomainExceptions"
import type { Money } from "../value-objects/Money";
import { TicketCode } from "../value-objects/TicketCode";

export enum BookingStatus {
  PendingPayment = 'PendingPayment',
  Paid = 'Paid',
  Expired = 'Expired',
  Refunded = 'Refunded',
}

export enum TicketStatus {
  Active = "active",
  CheckedIn = "CheckedIn",
  CheckedOut = "CheckedOut",
  Cancelled = "Cancelled",
}

export class Ticket extends Entity<string> {
  private _status: TicketStatus;
 
  constructor(
    id: string,
    public readonly eventId: string,
    public readonly code: TicketCode,
    status: TicketStatus = TicketStatus.Active,
  ) {
    super(id);
    this._status = status;
  }
 
  get status(): TicketStatus { return this._status; }
  get isActive(): boolean { return this._status === TicketStatus.Active; }
  get isCheckedIn(): boolean { return this._status === TicketStatus.CheckedIn; }
 
  /**
   * Marks the ticket as checked-in.
   * Called internally by Booking after Gate Officer validation.
   *
   * Rules (US-13):
   * - Ticket must be Active
   */
  public checkIn(): void {
    if (!this.isActive) {
      throw new InvalidStateException(
        `Ticket '${this.id}' cannot be checked in. Current status: ${this._status}.`,
      );
    }
    this._status = TicketStatus.CheckedIn;
  }
 
  /**
   * Cancels the ticket (e.g. when a refund is approved or event is cancelled).
   */
  public cancel(): void {
    if (this._status === TicketStatus.CheckedIn) {
      throw new InvalidStateException(
        `Ticket '${this.id}' has already been checked in and cannot be cancelled.`,
      );
    }
    this._status = TicketStatus.Cancelled;
  }
}

interface BookingProps {
  readonly eventId: string;
  readonly customerId: string;
  readonly categoryId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly paymentDeadline: Date;
}
 
export class Booking extends AggregateRoot<string> {
  private _status: BookingStatus;
  private readonly _tickets: Ticket[] = [];
 
  private constructor(
    id: string,
    private readonly _props: BookingProps,
    status: BookingStatus = BookingStatus.PendingPayment,
  ) {
    super(id);
    this._status = status;
  }
 
 
  get eventId(): string { return this._props.eventId; }
  get customerId(): string { return this._props.customerId; }
  get categoryId(): string { return this._props.categoryId; }
  get quantity(): number { return this._props.quantity; }
  get unitPrice(): Money { return this._props.unitPrice; }
  get paymentDeadline(): Date { return this._props.paymentDeadline; }
  get status(): BookingStatus { return this._status; }
  get tickets(): ReadonlyArray<Ticket> { return this._tickets; }
 
  /** Total price = unit price × quantity (US-9). */
  get totalPrice(): Money {
    return this._props.unitPrice.multiply(this._props.quantity);
  }
 
  // ---- Factory ----
 
  /**
   * Creates a new Booking in PendingPayment status.
   * Raises: TicketReserved
   *
   * Rules (US-8):
   * - Quantity must be > 0
   * - Payment deadline must be in the future (responsibility of caller/use case)
   */
  public static create(
    id: string,
    eventId: string,
    customerId: string,
    categoryId: string,
    quantity: number,
    unitPrice: Money,
    paymentDeadline: Date,
  ): Booking {
    if (quantity <= 0) {
      throw new InvalidQuantityException('Booking quantity must be greater than zero.');
    }
 
    const booking = new Booking(id, {
      eventId,
      customerId,
      categoryId,
      quantity,
      unitPrice,
      paymentDeadline,
    });
 
    booking.addDomainEvent(new TicketReserved(id));
    return booking;
  }
 
  // ---- Behaviour ----
 
  /**
   * Confirms payment for this booking and generates tickets.
   * Raises: BookingPaid
   *
   * Rules (US-10):
   * - Status must be PendingPayment
   * - Must be before payment deadline
   * - Payment amount must equal totalPrice
   */
  public pay(amount: Money, now: Date = new Date()): void {
    if (this._status !== BookingStatus.PendingPayment) {
      throw new InvalidStateException(
        `Booking '${this.id}' cannot be paid. Current status: ${this._status}.`,
      );
    }
    if (now > this._props.paymentDeadline) {
      throw new InvalidStateException(
        `Payment deadline for booking '${this.id}' has passed.`,
      );
    }
    if (!amount.isEqualTo(this.totalPrice)) {
      throw new InvalidPaymentException(
        `Payment amount ${amount} does not match total price ${this.totalPrice}.`,
      );
    }
 
    this._status = BookingStatus.Paid;
    this.generateTickets();
    this.addDomainEvent(new BookingPaid(this.id));
  }
 
  /**
   * Marks the booking as Expired after the payment deadline has passed.
   * Raises: BookingExpired
   *
   * Rules (US-11):
   * - Paid bookings cannot expire
   * - Deadline must have passed
   */
  public expire(now: Date = new Date()): void {
    if (this._status === BookingStatus.Paid) {
      throw new InvalidStateException(`Paid booking '${this.id}' cannot be expired.`);
    }
    if (this._status !== BookingStatus.PendingPayment) {
      throw new InvalidStateException(
        `Booking '${this.id}' cannot be expired. Current status: ${this._status}.`,
      );
    }
    if (now <= this._props.paymentDeadline) {
      throw new InvalidStateException(
        `Booking '${this.id}' payment deadline has not passed yet.`,
      );
    }
 
    this._status = BookingStatus.Expired;
    this.addDomainEvent(new BookingExpired(this.id));
  }
 
  /**
   * Checks in a specific ticket by its id.
   * Raises: TicketCheckedIn
   *
   * Rules (US-13):
   * - Booking must be Paid
   * - Ticket must belong to this booking
   * - Ticket must be Active
   */
  public checkInTicket(ticketId: string, now: Date = new Date()): void {
    if (this._status !== BookingStatus.Paid) {
      throw new InvalidStateException(
        `Cannot check in ticket: booking '${this.id}' is not Paid.`,
      );
    }
 
    const ticket = this.findTicketOrThrow(ticketId);
    ticket.checkIn();
    this.addDomainEvent(new TicketCheckedIn(this.id, ticketId));
  }
 
  /**
   * Marks this booking as Refunded and cancels all non-checked-in tickets.
   * Called by the application layer when a Refund is approved.
   */
  public markRefunded(): void {
    if (this._status !== BookingStatus.Paid) {
      throw new InvalidStateException(
        `Booking '${this.id}' must be Paid to be refunded.`,
      );
    }
 
    this._tickets
      .filter((t) => t.isActive)
      .forEach((t) => t.cancel());
 
    this._status = BookingStatus.Refunded;
  }
 
  // ---- Queries ----
 
  /** Returns true if any ticket in this booking has been checked in. */
  public hasCheckedInTickets(): boolean {
    return this._tickets.some((t) => t.isCheckedIn);
  }
 
  public findTicket(ticketId: string): Ticket | undefined {
    return this._tickets.find((t) => t.id === ticketId);
  }
 
  // ---- Helpers ----
 
  private generateTickets(): void {
    for (let i = 0; i < this._props.quantity; i++) {
      this._tickets.push(
        new Ticket(
          `${this.id}-tkt-${i + 1}`,
          this._props.eventId,
          TicketCode.generate(),
        ),
      );
    }
  }
 
  private findTicketOrThrow(ticketId: string): Ticket {
    const ticket = this.findTicket(ticketId);
    if (!ticket) {
      throw new Error(`Ticket '${ticketId}' does not belong to booking '${this.id}'.`);
    }
    return ticket;
  }
}
 