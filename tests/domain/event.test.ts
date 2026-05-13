import { describe, it, expect } from 'bun:test';
import { Event, EventStatus } from '../../src/domain/aggregates/Event';
import { InvalidCapacityException, InvalidDateException } from '../../src/domain/exceptions/DomainExceptions';

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