import type {
  BookingStatus as PrismaBookingStatus,
  EventStatus as PrismaEventStatus,
  RefundStatus as PrismaRefundStatus,
  TicketCategoryStatus as PrismaTicketCategoryStatus,
  TicketStatus as PrismaTicketStatus,
} from "@prisma/client";
import { BookingStatus, TicketStatus } from "../../domain/aggregates/Booking";
import {
  EventStatus,
  TicketCategoryStatus,
} from "../../domain/aggregates/Event";
import { RefundStatus } from "../../domain/aggregates/Refund";

/**
 * Map domain EventStatus to Prisma DB representation.
 * Used by event repository when persisting event state.
 * Related user stories: US-1, US-2, US-3, US-6, US-7
 */
export function toPrismaEventStatus(status: EventStatus): PrismaEventStatus {
  switch (status) {
    case EventStatus.Draft:
      return "Draft";
    case EventStatus.Published:
      return "Published";
    case EventStatus.Cancelled:
      return "Cancelled";
    case EventStatus.Completed:
      return "Completed";
  }
}

/**
 * Map Prisma DB EventStatus to domain EventStatus.
 * Used by event repository when rehydrating aggregates.
 * Related user stories: US-6, US-7 (and other event flows)
 */
export function toDomainEventStatus(status: PrismaEventStatus): EventStatus {
  switch (status) {
    case "Draft":
      return EventStatus.Draft;
    case "Published":
      return EventStatus.Published;
    case "Cancelled":
      return EventStatus.Cancelled;
    case "Completed":
      return EventStatus.Completed;
  }
}

/**
 * Map domain TicketCategoryStatus to Prisma DB representation.
 * Used by event repository when persisting categories.
 * Related user stories: US-4 (Create Ticket Category), US-5 (Disable Ticket Category), US-6, US-7
 */
export function toPrismaTicketCategoryStatus(
  status: TicketCategoryStatus,
): PrismaTicketCategoryStatus {
  switch (status) {
    case TicketCategoryStatus.Active:
      return "active";
    case TicketCategoryStatus.Disabled:
      return "disabled";
  }
}

/**
 * Map Prisma DB TicketCategoryStatus to domain TicketCategoryStatus.
 * Used when rehydrating event categories.
 * Related user stories: US-4, US-5, US-6, US-7
 */
export function toDomainTicketCategoryStatus(
  status: PrismaTicketCategoryStatus,
): TicketCategoryStatus {
  switch (status) {
    case "active":
      return TicketCategoryStatus.Active;
    case "disabled":
      return TicketCategoryStatus.Disabled;
  }
}

/**
 * Map domain BookingStatus to Prisma DB representation.
 * Used by booking repository when persisting booking state.
 * Related user stories: US-8, US-10, US-11, US-15..US-18, US-19
 */
export function toPrismaBookingStatus(
  status: BookingStatus,
): PrismaBookingStatus {
  switch (status) {
    case BookingStatus.PendingPayment:
      return "PendingPayment";
    case BookingStatus.Paid:
      return "Paid";
    case BookingStatus.Expired:
      return "Expired";
    case BookingStatus.Refunded:
      return "Refunded";
  }
}

/**
 * Map Prisma DB BookingStatus to domain BookingStatus.
 * Used when rehydrating bookings from DB.
 * Related user stories: US-8, US-10, US-11, US-15..US-18, US-19
 */
export function toDomainBookingStatus(
  status: PrismaBookingStatus,
): BookingStatus {
  switch (status) {
    case "PendingPayment":
      return BookingStatus.PendingPayment;
    case "Paid":
      return BookingStatus.Paid;
    case "Expired":
      return BookingStatus.Expired;
    case "Refunded":
      return BookingStatus.Refunded;
  }
}

/**
 * Map domain TicketStatus to Prisma DB representation.
 * Used by booking repository when persisting ticket state.
 * Related user stories: US-12 (View Purchased Tickets), US-13 (Check In Ticket), US-14 (Reject Invalid Check-in), US-16..US-17
 */
export function toPrismaTicketStatus(status: TicketStatus): PrismaTicketStatus {
  switch (status) {
    case TicketStatus.Active:
      return "active";
    case TicketStatus.CheckedIn:
      return "CheckedIn";
    case TicketStatus.CheckedOut:
      return "CheckedOut";
    case TicketStatus.Cancelled:
      return "Cancelled";
  }
}

/**
 * Map Prisma DB TicketStatus to domain TicketStatus.
 * Used when rehydrating tickets from DB.
 * Related user stories: US-12, US-13, US-14, US-16..US-17
 */
export function toDomainTicketStatus(status: PrismaTicketStatus): TicketStatus {
  switch (status) {
    case "active":
      return TicketStatus.Active;
    case "CheckedIn":
      return TicketStatus.CheckedIn;
    case "CheckedOut":
      return TicketStatus.CheckedOut;
    case "Cancelled":
      return TicketStatus.Cancelled;
  }
}

/**
 * Map domain RefundStatus to Prisma DB representation.
 * Used by refund repository when persisting refund state.
 * Related user stories: US-15..US-18
 */
export function toPrismaRefundStatus(status: RefundStatus): PrismaRefundStatus {
  switch (status) {
    case RefundStatus.Requested:
      return "Requested";
    case RefundStatus.Approved:
      return "Approved";
    case RefundStatus.Rejected:
      return "Rejected";
    case RefundStatus.PaidOut:
      return "PaidOut";
  }
}

/**
 * Map Prisma DB RefundStatus to domain RefundStatus.
 * Used when rehydrating refunds from DB.
 * Related user stories: US-15..US-18
 */
export function toDomainRefundStatus(status: PrismaRefundStatus): RefundStatus {
  switch (status) {
    case "Requested":
      return RefundStatus.Requested;
    case "Approved":
      return RefundStatus.Approved;
    case "Rejected":
      return RefundStatus.Rejected;
    case "PaidOut":
      return RefundStatus.PaidOut;
  }
}
