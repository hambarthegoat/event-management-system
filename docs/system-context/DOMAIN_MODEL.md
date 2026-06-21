### 2. Initial Domain Model Draft

**A. Event Aggregate (`src/domain/aggregates/event/`)**
*   **`Event` (Aggregate Root):**
    *   **Identity:** `EventId`
    *   **Attributes:** Name, Description, StartDate, EndDate, Location, MaxCapacity.
    *   **Status:** `EventStatus` (Draft | Published | Cancelled | Completed).
    *   **Relations:** Contains an array of `TicketCategory` entities.
*   **`TicketCategory` (Entity):**
    *   **Identity:** `TicketCategoryId`
    *   **Attributes:** Name, Price (`Money`), Quota, SalesStartDate, SalesEndDate.
    *   **Status:** `TicketCategoryStatus` (Active | Disabled).
*   **Domain Events (`src/domain/events/`):** `EventCreated`, `EventPublished`, `EventCancelled`, `TicketCategoryCreated`, `TicketCategoryDisabled`.

**B. Booking Aggregate (`src/domain/aggregates/booking/`)**
*   **`Booking` (Aggregate Root):**
    *   **Identity:** `BookingId`
    *   **Attributes:** EventId, CustomerId (`Email`), TicketCategoryId, Quantity, TotalPrice (`Money`), PaymentDeadline.
    *   **Status:** `BookingStatus` (PendingPayment | Paid | Expired | Refunded).
    *   **Relations:** Generates and holds an array of `Ticket` entities after successful payment.
*   **`Ticket` (Entity):**
    *   **Identity:** `TicketId`
    *   **Attributes:** EventId, `TicketCode` (Unique Value Object).
    *   **Status:** `TicketStatus` (Active | CheckedIn | Cancelled).
*   **Domain Events (`src/domain/events/`):** `TicketReserved`, `BookingPaid`, `BookingExpired`, `TicketCheckedIn`.

**C. Refund Aggregate (`src/domain/aggregates/refund/`)**
*   **`Refund` (Aggregate Root):**
    *   **Identity:** `RefundId`
    *   **Attributes:** BookingId, CustomerId, Amount (`Money`), RejectionReason (optional), PaymentReference (optional).
    *   **Status:** `RefundStatus` (Requested | Approved | Rejected | PaidOut).
*   **Domain Events (`src/domain/events/`):** `RefundRequested`, `RefundApproved`, `RefundRejected`, `RefundPaidOut`.

**D. Shared Value Objects (`src/domain/value-objects/`)**
*   **`Money`:** Encapsulates amount (cannot be negative) and currency.
*   **`TicketCode`:** Unique code used to identify and validate a ticket.
*   **`Email`:** Used to represent CustomerId and for notifications.

**E. Domain Services (`src/domain/services/`)**
*   **`TicketAvailabilityService`:** Validates if remaining quota is sufficient for new bookings by calculating category capacity minus active booking quantities. 

**F. Reporting / Participant DTO**
*   **Participant DTO:** The application layer exposes a `EventParticipantDTO` which maps paid booking tickets to participant entries containing `customerId`, `ticketCategoryName`, `ticketCode`, and `ticketStatus`.
*   **Reporting queries:** `GetEventParticipantsQuery` and `GetEventSalesReportQuery` are implemented in the application layer and depend on `IEventRepository` and `IBookingRepository` to compute participant lists and sales summaries.
