export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidDateException extends DomainException {}

export class InvalidCapacityException extends DomainException {}

export class InvalidStateException extends DomainException {}

export class InvalidPaymentException extends DomainException {}

export class InvalidQuantityException extends DomainException {}