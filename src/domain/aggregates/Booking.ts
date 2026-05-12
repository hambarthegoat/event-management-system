import { Entity } from "../common/Entity";
import {
  InvalidCapacityException,
  InvalidDateException,
  InvalidStateException
} from "../exceptions/DomainExceptions"
import type { TicketCode } from "../value-objects/TicketCode";

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