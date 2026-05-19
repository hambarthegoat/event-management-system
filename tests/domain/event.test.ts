import { describe, it, expect } from 'bun:test';
import { Event, EventStatus, TicketCategory, TicketCategoryStatus } from '../../src/domain/aggregates/Event';
import { Money } from '../../src/domain/value-objects/Money';
import { InvalidCapacityException, InvalidDateException, InvalidStateException } from '../../src/domain/exceptions/DomainExceptions';

// ---- Helpers ----

function makeEvent(overrides: Partial<{
  startDate: Date;
  endDate: Date;
  maxCapacity: number;
}> = {}): Event {
  const start = overrides.startDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days
  const end = overrides.endDate ?? new Date(start.getTime() + 2 * 60 * 60 * 1000);     // +2 hours
  return Event.create(
    'evt-1',
    'Tech Conference',
    'Annual tech conference',
    'Surabaya',
    start,
    end,
    overrides.maxCapacity ?? 100,
    'organizer-1',
  );
}

function makeCategory(overrides: Partial<{
  id: string;
  quota: number;
  price: number;
  salesEndDate: Date;
  eventStartDate: Date;
}> = {}): TicketCategory {
  const eventStart = overrides.eventStartDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const salesEnd = overrides.salesEndDate ?? new Date(eventStart.getTime() - 24 * 60 * 60 * 1000); // 1 day before event
  const salesStart = new Date(salesEnd.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days before salesEnd
  return new TicketCategory(
    overrides.id ?? 'cat-1',
    {
      name: 'Regular',
      price: Money.of(overrides.price ?? 150_000),
      quota: overrides.quota ?? 50,
      salesStartDate: salesStart,
      salesEndDate: salesEnd,
    },
  );
}

// ================================================================
// US-1: Create Event
// ================================================================

describe('US-1: Create Event', () => {
  it('creates an event with status Draft', () => {
    const event = makeEvent();
    expect(event.status).toBe(EventStatus.Draft);
  });

  it('raises EventCreated domain event on creation', () => {
    const event = makeEvent();
    const names = event.domainEvents.map((e) => e.constructor.name);
    expect(names).toContain('EventCreated');
  });

  it('throws InvalidDateException when endDate is before startDate', () => {
    const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() - 1000); // 1 second before start
    expect(() => makeEvent({ startDate: start, endDate: end }))
      .toThrow(InvalidDateException);
  });

  it('throws InvalidCapacityException when maxCapacity is zero', () => {
    expect(() => makeEvent({ maxCapacity: 0 }))
      .toThrow(InvalidCapacityException);
  });

  it('throws InvalidCapacityException when maxCapacity is negative', () => {
    expect(() => makeEvent({ maxCapacity: -10 }))
      .toThrow(InvalidCapacityException);
  });
});

// ================================================================
// US-4: Create Ticket Category
// ================================================================
 
describe('US-4: Create Ticket Category', () => {
  it('adds a valid ticket category to the event', () => {
    const event = makeEvent();
    const category = makeCategory();
    event.addTicketCategory(category);
    expect(event.categories).toHaveLength(1);
  });
 
  it('raises TicketCategoryCreated domain event', () => {
    const event = makeEvent();
    event.clearEvents();
    event.addTicketCategory(makeCategory());
    const names = event.domainEvents.map((e) => e.constructor.name);
    expect(names).toContain('TicketCategoryCreated');
  });
 
  it('throws InvalidCapacityException when quota is zero', () => {
    const event = makeEvent();
    expect(() => event.addTicketCategory(makeCategory({ quota: 0 })))
      .toThrow(InvalidCapacityException);
  });
 
  it('throws InvalidCapacityException when quota is negative', () => {
    const event = makeEvent();
    expect(() => event.addTicketCategory(makeCategory({ quota: -5 })))
      .toThrow(InvalidCapacityException);
  });
 
  it('throws InvalidCapacityException when total quota exceeds event maxCapacity', () => {
    const event = makeEvent(); // maxCapacity: 100
    event.addTicketCategory(makeCategory({ id: 'cat-1', quota: 60 }));
    expect(() => event.addTicketCategory(makeCategory({ id: 'cat-2', quota: 50 }))) // 60 + 50 = 110
      .toThrow(InvalidCapacityException);
  });
 
  it('throws InvalidDateException when salesEndDate is after event startDate', () => {
    const eventStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const event = makeEvent();
    const salesEndAfterEvent = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000); // 1 day AFTER event start
    expect(() => event.addTicketCategory(makeCategory({ salesEndDate: salesEndAfterEvent, eventStartDate: eventStart })))
      .toThrow(InvalidDateException);
  });
});

// ================================================================
// US-2: Publish Event
// ================================================================

describe('US-2: Publish Event', () => {
  it('throws InvalidStateException if it has zero active ticket categories', () => {
    const event = makeEvent();
    expect(() => event.publish()).toThrow(InvalidStateException);
  });

  it('sets event status to Published after publish()', () => {
    const event = makeEvent();
    event.addTicketCategory(makeCategory());
    event.publish();
    expect(event.status).toBe(EventStatus.Published);
  });

  it('throws InvalidStateException when publishing a Cancelled event', () => {
    const event = makeEvent();
    event.cancel();
    expect(() => event.publish()).toThrow(InvalidStateException);
  });

  it('raises EventPublished domain event', () => {
    const event = makeEvent();
    event.addTicketCategory(makeCategory());
    event.clearEvents();
    event.publish();
    const names = event.domainEvents.map((e) => e.constructor.name);
    expect(names).toContain('EventPublished');
  });

  it('allows publish if total quota exactly matches maxCapacity, and exceeding it at addTicketCategory throws InvalidCapacityException', () => {
    const event = makeEvent({ maxCapacity: 100 });
    // Fill to exact max capacity
    event.addTicketCategory(makeCategory({ id: 'cat-1', quota: 100 }));
    expect(() => event.publish()).not.toThrow();

    // Reset and test exceeding
    const event2 = makeEvent({ maxCapacity: 100 });
    expect(() => event2.addTicketCategory(makeCategory({ id: 'cat-2', quota: 101 })))
      .toThrow(InvalidCapacityException);
  });
});

// ================================================================
// US-3: Cancel Event
// ================================================================

describe('US-3: Cancel Event', () => {
  it('cancels a Published event and sets status to Cancelled', () => {
    const event = makeEvent();
    event.addTicketCategory(makeCategory());
    event.publish();
    event.cancel();
    expect(event.status).toBe(EventStatus.Cancelled);
  });

  it('throws InvalidStateException when cancelling a Completed event', () => {
    const event = makeEvent();
    (event as any)['_status'] = EventStatus.Completed;
    expect(() => event.cancel()).toThrow(InvalidStateException);
  });

  it('raises EventCancelled domain event', () => {
    const event = makeEvent();
    event.clearEvents();
    event.cancel();
    const names = event.domainEvents.map((e) => e.constructor.name);
    expect(names).toContain('EventCancelled');
  });

  it('throws InvalidStateException when cancelling an already-cancelled event', () => {
    const event = makeEvent();
    event.cancel();
    expect(() => event.cancel()).toThrow(InvalidStateException);
  });
});

// ================================================================
// US-5: Disable Ticket Category
// ================================================================

describe('US-5: Disable Ticket Category', () => {
  it('sets category.isActive to false and status to Disabled', () => {
    const event = makeEvent();
    const category = makeCategory({ id: 'cat-1' });
    event.addTicketCategory(category);
    
    event.disableTicketCategory('cat-1');
    expect(category.isActive).toBe(false);
    expect(category.status).toBe(TicketCategoryStatus.Disabled);
  });

  it('raises TicketCategoryDisabled domain event', () => {
    const event = makeEvent();
    event.addTicketCategory(makeCategory({ id: 'cat-1' }));
    event.clearEvents();
    
    event.disableTicketCategory('cat-1');
    const names = event.domainEvents.map((e) => e.constructor.name);
    expect(names).toContain('TicketCategoryDisabled');
  });

  it('throws InvalidStateException when disabling a category on a Completed event', () => {
    const event = makeEvent();
    event.addTicketCategory(makeCategory({ id: 'cat-1' }));
    (event as any)['_status'] = EventStatus.Completed;
    
    expect(() => event.disableTicketCategory('cat-1')).toThrow(InvalidStateException);
  });

  it('preserves the disabled category in event.categories', () => {
    const event = makeEvent();
    event.addTicketCategory(makeCategory({ id: 'cat-1' }));
    event.disableTicketCategory('cat-1');
    
    expect(event.categories).toHaveLength(1);
    expect(event.categories[0]!.id).toBe('cat-1');
    expect(event.categories[0]!.isActive).toBe(false);
  });
});