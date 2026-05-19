import { describe, it, expect } from 'bun:test';
import { Booking, BookingStatus } from '../../src/domain/aggregates/Booking';
import { Money } from '../../src/domain/value-objects/Money';
import { InvalidQuantityException, InvalidPaymentException, InvalidStateException } from '../../src/domain/exceptions/DomainExceptions';

// ================================================================
// HELPER FACTORIES
// ================================================================

function makeBooking(overrides?: Partial<{
  id: string;
  eventId: string;
  customerId: string;
  categoryId: string;
  quantity: number;
  unitPrice: Money;
  paymentDeadline: Date;
}>): Booking {
  const deadline = new Date(Date.now() + 15 * 60 * 1000); // 15 mins in future
  return Booking.create(
    overrides?.id ?? 'bk-1',
    overrides?.eventId ?? 'evt-1',
    overrides?.customerId ?? 'cust-1',
    overrides?.categoryId ?? 'cat-1',
    overrides?.quantity ?? 2,
    overrides?.unitPrice ?? Money.of(150_000),
    overrides?.paymentDeadline ?? deadline
  );
}

function makePaidBooking(overrides?: Partial<{
  id: string;
  eventId: string;
  customerId: string;
  categoryId: string;
  quantity: number;
  unitPrice: Money;
  paymentDeadline: Date;
}>): Booking {
  const booking = makeBooking(overrides);
  const payTime = new Date(booking.paymentDeadline.getTime() - 60 * 1000); // 1 minute before deadline
  booking.pay(booking.totalPrice, payTime);
  return booking;
}

// ================================================================
// US-8: Create Ticket Booking
// ================================================================

describe('US-8: Create Ticket Booking', () => {
  it('A newly created booking has status BookingStatus.PendingPayment', () => {
    const booking = makeBooking();
    expect(booking.status).toBe(BookingStatus.PendingPayment);
  });

  it('Booking.create() raises the domain event TicketReserved', () => {
    const booking = makeBooking();
    const eventNames = booking.domainEvents.map(e => e.constructor.name);
    expect(eventNames).toContain('TicketReserved');
  });

  it('quantity <= 0 throws InvalidQuantityException (0)', () => {
    expect(() => makeBooking({ quantity: 0 })).toThrow(InvalidQuantityException);
  });

  it('quantity <= 0 throws InvalidQuantityException (-1)', () => {
    expect(() => makeBooking({ quantity: -1 })).toThrow(InvalidQuantityException);
  });

  it('paymentDeadline is stored and accessible via booking.paymentDeadline', () => {
    const deadline = new Date(Date.now() + 10 * 60 * 1000);
    const booking = makeBooking({ paymentDeadline: deadline });
    expect(booking.paymentDeadline).toEqual(deadline);
  });

  it('booking.tickets is empty immediately after creation', () => {
    const booking = makeBooking();
    expect(booking.tickets).toHaveLength(0);
  });
});

// ================================================================
// US-9: Calculate Booking Total Price
// ================================================================

describe('US-9: Calculate Booking Total Price', () => {
  it('totalPrice = unitPrice × quantity', () => {
    const booking = makeBooking({ unitPrice: Money.of(100_000), quantity: 3 });
    expect(booking.totalPrice.amount).toBe(300_000);
  });

  it('totalPrice is an instance of Money', () => {
    const booking = makeBooking();
    expect(booking.totalPrice).toBeInstanceOf(Money);
  });

  it('Money.of(0) × any positive quantity = Money.of(0)', () => {
    const booking = makeBooking({ unitPrice: Money.of(0), quantity: 5 });
    expect(booking.totalPrice.amount).toBe(0);
    expect(booking.totalPrice.currency).toBe('IDR');
  });
});

// ================================================================
// US-10: Pay Booking
// ================================================================

describe('US-10: Pay Booking', () => {
  it('Paying with correct amount and before deadline -> status becomes Paid', () => {
    const booking = makeBooking();
    const now = new Date(booking.paymentDeadline.getTime() - 1000);
    booking.pay(booking.totalPrice, now);
    expect(booking.status).toBe(BookingStatus.Paid);
  });

  it('Paying raises the domain event BookingPaid', () => {
    const booking = makeBooking();
    booking.clearEvents(); // clear TicketReserved
    const now = new Date(booking.paymentDeadline.getTime() - 1000);
    booking.pay(booking.totalPrice, now);
    const eventNames = booking.domainEvents.map(e => e.constructor.name);
    expect(eventNames).toContain('BookingPaid');
  });

  it('After payment, booking.tickets.length === booking.quantity', () => {
    const booking = makeBooking({ quantity: 3 });
    const now = new Date(booking.paymentDeadline.getTime() - 1000);
    booking.pay(booking.totalPrice, now);
    expect(booking.tickets).toHaveLength(3);
  });

  it('Paying a booking that is NOT PendingPayment throws InvalidStateException', () => {
    const booking = makeBooking();
    const now = new Date(booking.paymentDeadline.getTime() - 1000);
    booking.pay(booking.totalPrice, now); // now Paid
    expect(() => booking.pay(booking.totalPrice, now)).toThrow(InvalidStateException);
  });

  it('Paying after the payment deadline has passed throws InvalidStateException', () => {
    const booking = makeBooking();
    const late = new Date(booking.paymentDeadline.getTime() + 1000);
    expect(() => booking.pay(booking.totalPrice, late)).toThrow(InvalidStateException);
  });

  it('Paying with an incorrect amount throws InvalidPaymentException (under-payment)', () => {
    const booking = makeBooking({ unitPrice: Money.of(100_000), quantity: 2 });
    const underPayment = Money.of(199_999);
    const now = new Date(booking.paymentDeadline.getTime() - 1000);
    expect(() => booking.pay(underPayment, now)).toThrow(InvalidPaymentException);
  });

  it('Paying with an incorrect amount throws InvalidPaymentException (over-payment)', () => {
    const booking = makeBooking({ unitPrice: Money.of(100_000), quantity: 2 });
    const overPayment = Money.of(200_001);
    const now = new Date(booking.paymentDeadline.getTime() - 1000);
    expect(() => booking.pay(overPayment, now)).toThrow(InvalidPaymentException);
  });
});
