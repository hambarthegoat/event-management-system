import { randomUUID } from 'crypto';
import type { BookingDTO, CreateBookingRequestDTO } from '../../dtos';
import { Booking } from '../../../domain/aggregates/Booking';
import type { IBookingRepository, IEventRepository } from '../../../domain/repositories/Interfaces';
import { TicketAvailabilityService } from '../../../domain/services/TicketAvailabilityServices';
import { ConflictError, NotFoundError, ValidationError } from '../common/ApplicationErrors';
import type { ICommandHandler } from '../common/Command';
import { toBookingDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-8 Create Ticket Booking */
export class CreateBookingCommandHandler
  implements ICommandHandler<CreateBookingRequestDTO, BookingDTO>
{
  private readonly availabilityService: TicketAvailabilityService;

  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly bookingRepository: IBookingRepository,
  ) {
    this.availabilityService = new TicketAvailabilityService(bookingRepository);
  }

  async execute(command: CreateBookingRequestDTO): Promise<BookingDTO> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) throw new NotFoundError(`Event '${command.eventId}' not found.`);

    if (!event.isPublished()) {
      throw new ValidationError('A booking can only be created for a Published event.');
    }

    const category = event.findCategory(command.categoryId);
    if (!category) {
      throw new NotFoundError(
        `Ticket category '${command.categoryId}' not found in event '${event.id}'.`,
      );
    }

    const now = new Date();
    if (!category.isSalesOpen(now)) {
      throw new ValidationError('Ticket category sales are not open.');
    }

    const existing = await this.bookingRepository.findActiveByCustomerAndEvent(
      command.customerId,
      command.eventId,
    );
    if (existing) {
      throw new ConflictError('Customer already has an active booking for this event.');
    }

    await this.availabilityService.assertQuotaAvailable(
      event,
      command.categoryId,
      command.quantity,
    );

    const paymentDeadline = new Date(now.getTime() + 15 * 60 * 1000);
    const booking = Booking.create(
      randomUUID(),
      event.id,
      command.customerId,
      command.categoryId,
      command.quantity,
      category.price,
      paymentDeadline,
    );

    await this.bookingRepository.save(booking);
    return toBookingDTO(booking);
  }
}
