export type NotificationChannel = 'email' | 'whatsapp';

export interface NotificationRecipientDTO {
  userId: string;
  email?: string;
  phoneNumber?: string;
}

export interface NotificationMessageDTO {
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

/**
 * - External System: Notification Service
 * - Used by application layer after domain events / state changes, e.g.:
 *   US-1 (EventCreated), US-2 (EventPublished), US-3 (EventCancelled),
 *   US-8 (TicketReserved), US-10 (BookingPaid), US-11 (BookingExpired),
 *   US-13 (TicketCheckedIn), US-15..US-18 (Refund lifecycle).
 */
export interface INotificationService {
  send(
    recipient: NotificationRecipientDTO,
    message: NotificationMessageDTO,
    channel: NotificationChannel,
  ): Promise<void>;
}
