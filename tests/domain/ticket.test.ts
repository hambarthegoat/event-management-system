import { describe, it, expect } from 'bun:test';
import { Booking, BookingStatus, TicketStatus } from '../../src/domain/aggregates/Booking';
import { Money } from '../../src/domain/value-objects/Money';
import { InvalidStateException } from '../../src/domain/exceptions/DomainExceptions';

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

function makePaidBookingWithTickets(overrides?: Partial<{
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
// US-12: View Purchased Tickets
// ================================================================

describe('US-12: View Purchased Tickets', () => {
  it('After payment, booking.tickets contains exactly booking.quantity Ticket entities', () => {
    const quantity = 3;
    const booking = makePaidBookingWithTickets({ quantity });
    expect(booking.tickets).toHaveLength(quantity);
  });

  it('Each ticket has a unique code', () => {
    const booking = makePaidBookingWithTickets({ quantity: 5 });
    const codes = booking.tickets.map(t => t.code.value);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(5);
  });

  it('Each ticket initial status is TicketStatus.Active', () => {
    const booking = makePaidBookingWithTickets({ quantity: 2 });
    booking.tickets.forEach(ticket => {
      expect(ticket.status).toBe(TicketStatus.Active);
    });
  });

  it('Each ticket has the correct eventId matching the booking eventId', () => {
    const eventId = 'evt-999';
    const booking = makePaidBookingWithTickets({ eventId, quantity: 2 });
    booking.tickets.forEach(ticket => {
      expect(ticket.eventId).toBe(eventId);
    });
  });
});

// ================================================================
// US-13: Check In Ticket
// ================================================================

describe('US-13: Check In Ticket', () => {
  it('Calling booking.checkInTicket(ticketId) on a Paid booking with an Active ticket changes its status to CheckedIn', () => {
    const booking = makePaidBookingWithTickets({ quantity: 2 });
    const ticketToCheckIn = booking.tickets[0];
    
    booking.checkInTicket(ticketToCheckIn!.id);
    
    expect(ticketToCheckIn!.status).toBe(TicketStatus.CheckedIn);
    expect(ticketToCheckIn!.isCheckedIn).toBe(true);
  });

  it('checkInTicket() raises the domain event TicketCheckedIn', () => {
    const booking = makePaidBookingWithTickets({ quantity: 1 });
    const ticketToCheckIn = booking.tickets[0];
    booking.clearEvents();
    
    booking.checkInTicket(ticketToCheckIn!.id);
    const eventNames = booking.domainEvents.map(e => e.constructor.name);
    
    expect(eventNames).toContain('TicketCheckedIn');
  });

  it('booking.hasCheckedInTickets() returns true after at least one check-in', () => {
    const booking = makePaidBookingWithTickets({ quantity: 2 });
    expect(booking.hasCheckedInTickets()).toBe(false);
    
    booking.checkInTicket(booking.tickets[0]!.id);
    expect(booking.hasCheckedInTickets()).toBe(true);
  });
});

// ================================================================
// US-14: Reject Invalid Ticket Check-in
// ================================================================

describe('US-14: Reject Invalid Ticket Check-in', () => {
  it('Checking in a ticket that is already CheckedIn throws InvalidStateException', () => {
    const booking = makePaidBookingWithTickets({ quantity: 1 });
    const ticket = booking.tickets[0];
    booking.checkInTicket(ticket!.id); // first check-in
    
    expect(() => booking.checkInTicket(ticket!.id)).toThrow(InvalidStateException);
  });

  it('Checking in a ticket that belongs to a different booking throws an error', () => {
    const booking = makePaidBookingWithTickets({ quantity: 1 });
    expect(() => booking.checkInTicket('some-unknown-id')).toThrow(Error);
  });

  it('Calling checkInTicket() on a non-Paid booking throws InvalidStateException', () => {
    const booking = makeBooking({ quantity: 1 }); // PendingPayment status
    // Cannot easily access a ticket without paying first, but we can try checking in an arbitrary ID
    expect(() => booking.checkInTicket('some-ticket-id')).toThrow(InvalidStateException);
  });
});
