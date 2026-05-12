import { AggregateRoot } from '../common/AggregateRoot';
import { Money } from '../value-objects/Money';
import { InvalidStateException } from '../exceptions/DomainExceptions';
import {
  RefundPaidOut,
  RefundRejected,
  RefundRequested,
} from '../events/RefundEvents';

import { RefundApproved } from '../events/RefundEvents';

export enum RefundStatus {
  Requested = 'Requested',
  Approved = 'Approved',
  Rejected = 'Rejected',
  PaidOut = 'PaidOut',
}

export class Refund extends AggregateRoot<string> {
  private _status: RefundStatus;
  private _rejectionReason?: string;
  private _paymentReference?: string;

  private constructor(
    id: string,
    public readonly bookingId: string,
    public readonly amount: Money,
    status: RefundStatus = RefundStatus.Requested,
  ) {
    super(id);
    this._status = status;
  }

  get status(): RefundStatus { return this._status; }
  get rejectionReason(): string | undefined { return this._rejectionReason; }
  get paymentReference(): string | undefined { return this._paymentReference; }

  // ---- Factory ----

  /**
   * Creates a refund request for a booking.
   * Raises: RefundRequested
   *
   * Rules (US-15):
   * - Validation that the booking is eligible (Paid, no checked-in tickets)
   *   is the responsibility of the application layer / domain service,
   *   since it requires loading the Booking aggregate.
   */
  public static request(id: string, bookingId: string, amount: Money): Refund {
    const refund = new Refund(id, bookingId, amount);
    refund.addDomainEvent(new RefundRequested(id));
    return refund;
  }

  // ---- Behaviour ----

  /**
   * Approves this refund.
   * Raises: RefundApproved
   *
   * Rules (US-16):
   * - Status must be Requested
   */
  public approve(): void {
    this.assertStatus(RefundStatus.Requested, 'approve');
    this._status = RefundStatus.Approved;
    this.addDomainEvent(new RefundApproved(this.id));
  }

  /**
   * Rejects this refund with a mandatory reason.
   * Raises: RefundRejected
   *
   * Rules (US-17):
   * - Status must be Requested
   * - Reason must be provided
   */
  public reject(reason: string): void {
    this.assertStatus(RefundStatus.Requested, 'reject');
    if (!reason || reason.trim() === '') {
      throw new Error('A rejection reason must be provided.');
    }

    this._status = RefundStatus.Rejected;
    this._rejectionReason = reason.trim();
    this.addDomainEvent(new RefundRejected(this.id));
  }

  /**
   * Marks this refund as paid out to the customer.
   * Raises: RefundPaidOut
   *
   * Rules (US-18):
   * - Status must be Approved
   * - Payment reference must be provided
   */
  public markPaidOut(paymentReference: string): void {
    this.assertStatus(RefundStatus.Approved, 'mark as paid out');
    if (!paymentReference || paymentReference.trim() === '') {
      throw new Error('A payment reference must be provided when marking a refund as paid out.');
    }

    this._status = RefundStatus.PaidOut;
    this._paymentReference = paymentReference.trim();
    this.addDomainEvent(new RefundPaidOut(this.id, paymentReference));
  }

  // ---- Helpers ----

  private assertStatus(expected: RefundStatus, operation: string): void {
    if (this._status !== expected) {
      throw new InvalidStateException(
        `Cannot ${operation} refund '${this.id}'. ` +
        `Expected status '${expected}', got '${this._status}'.`,
      );
    }
  }
}