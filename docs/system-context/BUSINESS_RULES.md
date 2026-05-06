### 1. Initial Business Rules

**A. Event & Ticket Category Rules (`src/domain/aggregates/event/`)**
*   **Event Creation:** Cannot be created if `endDate` is earlier than `startDate` or if `maxCapacity` <= 0. Newly created events must have `Draft` status
*   **Ticket Category Creation:** Price cannot be negative, quota must be > 0, and sales period must end before or at the event start date
*   **Quota Validation:** The total quota of all ticket categories must not exceed the event's maximum capacity
*   **Publish Event:** A `Draft` event can be published only if it has at least one active ticket category and the total quota does not exceed capacity
*   **Cancel Event:** Cancelling a `Published` event stops ticket sales. Paid bookings must be marked as requiring a refund. A `Completed` event cannot be cancelled

**B. Booking & Ticket Rules (`src/domain/aggregates/booking/`)**
*   **Booking Creation:** Allowed only for `Published` events, active ticket categories, and within the sales period. Quantity must be > 0 and cannot exceed the remaining quota
*   **Customer Limits:** A customer cannot have more than one active booking (`PendingPayment` status) for the same event.
*   **Price Calculation:** Total price is ticket unit price multiplied by quantity (plus service fees), cannot be negative, and is represented by the `Money` value object
*   **Payment & Expiry:** Bookings can be paid before the `paymentDeadline` with the exact total price. If unpaid after the deadline, the status changes to `Expired` and the reserved quota is released
*   **Ticket Check-in:** Unique `TicketCode` is issued after payment. Check-in is only valid if the ticket is `Active`, matches the event, and is done within the allowed window. Checked-in tickets change to `CheckedIn` status and cannot be reused

**C. Refund Rules (`src/domain/aggregates/refund/`)**
*   **Refund Request:** Can only be requested for `Paid` bookings, before the refund deadline, and if no tickets from the booking have been checked in. Refunds are automatically allowed if an event is cancelled
*   **Refund Approval:** If `Approved`, related tickets change to `Cancelled` and the booking status changes to `Refunded`. If `Rejected`, a rejection reason must be provided and tickets remain `Active`
*   **Refund Payout:** Admins mark approved refunds as `PaidOut` and must record a payment reference

---