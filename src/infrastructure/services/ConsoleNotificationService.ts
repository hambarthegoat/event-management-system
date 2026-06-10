import type {
  INotificationService,
  NotificationChannel,
  NotificationMessageDTO,
  NotificationRecipientDTO,
} from '../../application/interfaces/INotificationService';

export class ConsoleNotificationService implements INotificationService {
  async send(
    recipient: NotificationRecipientDTO,
    message: NotificationMessageDTO,
    channel: NotificationChannel,
  ): Promise<void> {
    console.log(
      `[notification:${channel}] user=${recipient.userId} subject=${message.subject ?? ''} body=${message.body}`,
    );
  }
}
