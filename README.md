# Event Ticketing and Booking System

An Event Ticketing and Booking System implemented using Clean Architecture and Domain-Driven Design (DDD) tactical patterns.

## Tech Stack
*   Runtime: Bun
*   Framework: Express.js with TypeScript
*   Database: PostgreSQL
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
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=yourpassword
   DB_NAME=event_ticketing_db
   ```

### Database Migration
Run the following command to execute SQL migrations and set up the schema:
```bash
bun run migrate
```

### Running the Project
*   Development: `npm run dev`
*   Production: `npm run build && npm start`

## Running Tests
Unit tests for the domain logic are implemented using Jest.
```bash
bun test
```

## Implemented Features (Case Study Requirements)

### User Stories
- [ ] Create Event, Publish Event, Cancel Event
- [ ] Create Ticket Category, Disable Ticket Category
- [ ] View Available Events, View Event Details
- [ ] Create Ticket Booking, Calculate Booking Total Price
- [ ] Pay Booking, Expire Booking
- [ ] View Purchased Tickets, Check In Ticket, Reject Invalid Ticket Check-in
- [ ] Request Refund, Approve Refund, Reject Refund, Mark Refund as Paid Out
- [ ] View Event Sales Report, View Event Participants

### Domain Events
- [ ] EventCreated, EventPublished, EventCancelled
- [ ] TicketCategoryCreated, TicketCategoryDisabled
- [ ] TicketReserved, BookingPaid, BookingExpired, TicketCheckedIn
- [ ] RefundRequested, RefundApproved, RefundRejected, RefundPaidOut

### Application Service Interfaces
- [ ] IPaymentGateway
- [ ] IRefundPaymentService
- [ ] INotificationService
```