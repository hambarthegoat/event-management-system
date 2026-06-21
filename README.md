# Event Ticketing and Booking System

An Event Ticketing and Booking System implemented using Clean Architecture and Domain-Driven Design (DDD) tactical patterns.

## Tech Stack
*   Runtime: Bun
*   Framework: Express.js with TypeScript
*   Database: PostgreSQL (Prisma ORM)
*   Architecture: Clean Architecture & DDD (Domain, Application, Infrastructure, Presentation)

## System Documentation
Detailed system design and contexts are separated into the following documents:
*   [Business Rules](docs/system-context/BUSINESS_RULES.md)
*   [Domain Model](docs/system-context/DOMAIN_MODEL.md)
*   [Ubiquitous Language](docs/system-context/UBIQUITOUS_LANGUAGE.md)

## Getting Started

### Prerequisites
*   Bun (1.3.13)
*   PostgreSQL (v14+)

### Installation and PostgreSQL Configuration
1. Clone the repository and install dependencies:
   ```bash
   bun install
   ```
2. Set up the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Configure your PostgreSQL connection in the `.env` file:
   ```env
   DATABASE_CONNECTION="postgresql://postgres@localhost:5432/event_management_system"
   ```

### Database Migration
Run the following command to apply the Prisma schema to your database:
```bash
bun run migrate
```

### Running the Project
*   Development: `bun run dev`
*   Production: `bun run build && bun start`

## Running Tests
```bash
bun test
```

## Implemented Features (Case Study Requirements)

### User Stories
- [x] Create Event, Publish Event, Cancel Event
- [x] Create Ticket Category, Disable Ticket Category
- [x] View Available Events, View Event Details
- [x] Create Ticket Booking, Calculate Booking Total Price
- [x] Pay Booking, Expire Booking
- [x] View Purchased Tickets, Check In Ticket, Reject Invalid Ticket Check-in
- [x] Request Refund, Approve Refund, Reject Refund, Mark Refund as Paid Out
- [x] View Event Sales Report, View Event Participants

### Domain Events
- [x] EventCreated, EventPublished, EventCancelled
- [x] TicketCategoryCreated, TicketCategoryDisabled
- [x] TicketReserved, BookingPaid, BookingExpired, TicketCheckedIn
- [x] RefundRequested, RefundApproved, RefundRejected, RefundPaidOut

### Application Service Interfaces
- [x] IPaymentGateway
- [x] IRefundPaymentService
- [x] INotificationService
```