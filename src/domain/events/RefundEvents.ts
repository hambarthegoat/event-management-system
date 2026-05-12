import type { DomainEvent } from "../common/DomainEvent";

export class RefundRequested implements DomainEvent{
  readonly occurredOn: Date = new Date();
  constructor(public readonly refundId: string) {}
}

export class RefundApproved implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(public readonly refundId: string) {}
}

export class RefundRejected implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(public readonly refundId: string) {}
}

export class RefundPaidOut implements DomainEvent {
  readonly occurredOn: Date = new Date();
  constructor(
    public readonly refundId: string,
    public readonly paymentReference: string,
  ) {}
}