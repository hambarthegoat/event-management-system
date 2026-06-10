import type { Prisma, PrismaClient } from "@prisma/client";
import type { IEventRepository } from "../../domain/repositories/Interfaces";
import {
  Event,
  EventStatus,
  TicketCategory,
} from "../../domain/aggregates/Event";
import { Money } from "../../domain/value-objects/Money";
import {
  toDomainEventStatus,
  toDomainTicketCategoryStatus,
  toPrismaEventStatus,
  toPrismaTicketCategoryStatus,
} from "./PrismaMappers";

type EventRecord = Prisma.EventGetPayload<{
  include: { categories: true };
}>;

export class PrismaEventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find an Event aggregate by id (including categories).
   * User Stories: US-7 (View Event Details)
   * Also used by flows that update/publish/cancel an event (US-1, US-2, US-3).
   */
  async findById(id: string): Promise<Event | null> {
    const record = await this.prisma.event.findUnique({
      where: { id },
      include: { categories: true },
    });
    if (!record) return null;
    return toDomainEvent(record);
  }

  /**
   * Persist an Event aggregate (create or update) together with its ticket categories in a transaction.
   * User Stories: US-1 (Create Event), US-2 (Publish Event), US-3 (Cancel Event),
   * US-4 (Create Ticket Category), US-5 (Disable Ticket Category)
   */
  async save(event: Event): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.event.upsert({
        where: { id: event.id },
        create: {
          id: event.id,
          name: event.name,
          description: event.description,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          maxCapacity: event.maxCapacity,
          organizerId: event.organizerId,
          status: toPrismaEventStatus(event.status),
        },
        update: {
          name: event.name,
          description: event.description,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          maxCapacity: event.maxCapacity,
          organizerId: event.organizerId,
          status: toPrismaEventStatus(event.status),
        },
      });

      for (const category of event.categories) {
        await tx.ticketCategory.upsert({
          where: { id: category.id },
          create: {
            id: category.id,
            eventId: event.id,
            name: category.name,
            priceAmount: category.price.amount,
            priceCurrency: category.price.currency,
            quota: category.quota,
            salesStartDate: category.salesStartDate,
            salesEndDate: category.salesEndDate,
            status: toPrismaTicketCategoryStatus(category.status),
          },
          update: {
            name: category.name,
            priceAmount: category.price.amount,
            priceCurrency: category.price.currency,
            quota: category.quota,
            salesStartDate: category.salesStartDate,
            salesEndDate: category.salesEndDate,
            status: toPrismaTicketCategoryStatus(category.status),
          },
        });
      }
    });
  }

  /**
   * Query Published events (optionally filter by location/date) and map to domain Event aggregates.
   * User Stories: US-6 (View Available Events)
   */
  async findAllPublished(filter?: {
    location?: string;
    date?: string;
  }): Promise<Event[]> {
    let startDateFilter: Date | undefined;
    if (filter?.date) {
      startDateFilter = new Date(filter.date);
      if (Number.isNaN(startDateFilter.getTime())) {
        throw new Error(`Invalid date filter: '${filter.date}'.`);
      }
    }

    const events = await this.prisma.event.findMany({
      where: {
        status: toPrismaEventStatus(EventStatus.Published),
        ...(filter?.location
          ? {
              location: {
                contains: filter.location.trim(),
                mode: "insensitive",
              },
            }
          : {}),
        ...(startDateFilter ? { startDate: { gte: startDateFilter } } : {}),
      },
      include: { categories: true },
      orderBy: { startDate: "asc" },
    });

    return events.map(toDomainEvent);
  }
}

/**
 * Map a DB event record to domain Event aggregate (rehydrate).
 * Used by repository read methods supporting: US-6 (View Available Events), US-7 (View Event Details)
 */
function toDomainEvent(record: NonNullable<EventRecord>): Event {
  const categories = record.categories.map(
    (category) =>
      new TicketCategory(
        category.id,
        {
          name: category.name,
          price: Money.of(category.priceAmount, category.priceCurrency),
          quota: category.quota,
          salesStartDate: category.salesStartDate,
          salesEndDate: category.salesEndDate,
        },
        toDomainTicketCategoryStatus(category.status),
      ),
  );

  return Event.rehydrate(
    record.id,
    {
      name: record.name,
      description: record.description,
      location: record.location,
      startDate: record.startDate,
      endDate: record.endDate,
      maxCapacity: record.maxCapacity,
      organizerId: record.organizerId,
    },
    toDomainEventStatus(record.status),
    categories,
  );
}
