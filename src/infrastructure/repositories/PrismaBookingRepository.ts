import type {
  PrismaClient,
  BookingStatus as PrismaBookingStatus,
  TicketStatus as PrismaTicketStatus,
} from "@prisma/client";
import type { IBookingRepository } from "../../domain/repositories/Interfaces";
import {
  Booking,
  BookingStatus,
  Ticket,
  TicketStatus,
} from "../../domain/aggregates/Booking";
import { Money } from "../../domain/value-objects/Money";
import { TicketCode } from "../../domain/value-objects/TicketCode";
import {
  toDomainBookingStatus,
  toDomainTicketStatus,
  toPrismaBookingStatus,
  toPrismaTicketStatus,
} from "./PrismaMappers";

type TicketRecord = {
  id: string;
  bookingId: string;
  eventId: string;
  code: string;
  status: PrismaTicketStatus;
};

type BookingRecord = {
  id: string;
  eventId: string;
  customerId: string;
  categoryId: string;
  quantity: number;
  unitPriceAmount: number;
  unitPriceCurrency: string;
  paymentDeadline: Date;
  status: PrismaBookingStatus;
  tickets: TicketRecord[];
};

type TicketWithBookingRecord = TicketRecord & {
  booking: BookingRecord;
};

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find a Booking by id.
   * User Stories: US-10 (Pay Booking), US-11 (Expire Booking), US-13 (Check In Ticket), US-15 (Request Refund)
   */
  async findById(id: string): Promise<Booking | null> {
    const record = await this.prisma.booking.findUnique({
      where: { id },
      include: { tickets: true },
    });
    if (!record) return null;
    return toDomainBooking(record);
  }

  /**
   * Find a Booking by ticket code.
   * User Stories: US-13 (Check In Ticket), US-14 (Reject Invalid Ticket Check-in)
   */
  async findByTicketCode(code: string): Promise<Booking | null> {
    const record = await this.prisma.ticket.findFirst({
      where: { code },
      include: {
        booking: {
          include: { tickets: true },
        },
      },
    });

    if (!record) return null;
    return toDomainBooking(record.booking);
  }

  /**
   * Find an active booking (PendingPayment or Paid) for a customer and event.
   * User Stories: US-8 (Create Ticket Booking) - prevents multiple active bookings per customer/event
   */
  async findActiveByCustomerAndEvent(
    customerId: string,
    eventId: string,
  ): Promise<Booking | null> {
    const record = await this.prisma.booking.findFirst({
      where: {
        customerId,
        eventId,
        status: {
          in: [
            toPrismaBookingStatus(BookingStatus.PendingPayment),
            toPrismaBookingStatus(BookingStatus.Paid),
          ],
        },
      },
      include: { tickets: true },
      orderBy: { paymentDeadline: "asc" },
    });
    if (!record) return null;
    return toDomainBooking(record);
  }

  /**
   * Count the total quantity of active bookings for a ticket category.
   * User Stories: US-8 (Create Ticket Booking) - used to check remaining quota
   *              US-19 (View Event Sales Report) - used when computing sold quantities
   */
  async countActiveByCategory(categoryId: string): Promise<number> {
    const result = await this.prisma.booking.aggregate({
      where: {
        categoryId,
        status: {
          in: [
            toPrismaBookingStatus(BookingStatus.PendingPayment),
            toPrismaBookingStatus(BookingStatus.Paid),
          ],
        },
      },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  }

  /**
   * Persist a Booking aggregate (create or update) and its tickets atomically.
   * User Stories: US-8 (Create Ticket Booking), US-10 (Pay Booking), US-11 (Expire Booking),
   *               US-13 (Check In Ticket), US-16/17/18 (Refund flows update booking/ticket state)
   */
  async save(booking: Booking): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.booking.upsert({
        where: { id: booking.id },
        create: {
          id: booking.id,
          eventId: booking.eventId,
          customerId: booking.customerId,
          categoryId: booking.categoryId,
          quantity: booking.quantity,
          unitPriceAmount: booking.unitPrice.amount,
          unitPriceCurrency: booking.unitPrice.currency,
          paymentDeadline: booking.paymentDeadline,
          status: toPrismaBookingStatus(booking.status),
        },
        update: {
          eventId: booking.eventId,
          customerId: booking.customerId,
          categoryId: booking.categoryId,
          quantity: booking.quantity,
          unitPriceAmount: booking.unitPrice.amount,
          unitPriceCurrency: booking.unitPrice.currency,
          paymentDeadline: booking.paymentDeadline,
          status: toPrismaBookingStatus(booking.status),
        },
      });

      for (const ticket of booking.tickets) {
        await tx.ticket.upsert({
          where: { id: ticket.id },
          create: {
            id: ticket.id,
            bookingId: booking.id,
            eventId: ticket.eventId,
            code: ticket.code.value,
            status: toPrismaTicketStatus(ticket.status),
          },
          update: {
            eventId: ticket.eventId,
            code: ticket.code.value,
            status: toPrismaTicketStatus(ticket.status),
          },
        });
      }
    });
  }

  /**
   * Returns all bookings for a given customer.
   * User Stories: US-12 (View Purchased Tickets)
   */
  async findByCustomerId(customerId: string): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { customerId },
      include: { tickets: true },
      orderBy: { paymentDeadline: "desc" },
    });
    return bookings.map(toDomainBooking);
  }

  /**
   * Returns all bookings for a specific event.
   * User Stories: US-19 (View Event Sales Report), US-20 (View Event Participants)
   */
  async findByEventId(eventId: string): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { eventId },
      include: { tickets: true },
      orderBy: { paymentDeadline: "desc" },
    });
    return bookings.map(toDomainBooking);
  }
}

/**
 * Map a DB booking record (with tickets) to a domain Booking aggregate.
 * Used by repository read methods for flows: US-8, US-10, US-11, US-12, US-13, US-19, US-20
 */
function toDomainBooking(record: BookingRecord): Booking {
  const tickets = record.tickets.map(
    (ticket) =>
      new Ticket(
        ticket.id,
        ticket.eventId,
        TicketCode.of(ticket.code),
        toDomainTicketStatus(ticket.status),
      ),
  );

  return Booking.rehydrate(
    record.id,
    {
      eventId: record.eventId,
      customerId: record.customerId,
      categoryId: record.categoryId,
      quantity: record.quantity,
      unitPrice: Money.of(record.unitPriceAmount, record.unitPriceCurrency),
      paymentDeadline: record.paymentDeadline,
    },
    toDomainBookingStatus(record.status),
    tickets,
  );
}
