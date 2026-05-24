import type { BookingDTO, CheckInTicketRequestDTO } from '../../dtos';
import type { IBookingRepository, IEventRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError, ValidationError } from '../common/ApplicationErrors';
import { parseISODate } from '../common/DateUtils';
import { toBookingDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-13 Check In Ticket + US-14 Reject Invalid Ticket Check-in */
export class CheckInTicketCommandHandler
  implements ICommandHandler<CheckInTicketRequestDTO, BookingDTO>
{
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(command: CheckInTicketRequestDTO): Promise<BookingDTO> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) throw new NotFoundError(`Booking '${command.bookingId}' not found.`);

    const event = await this.eventRepository.findById(booking.eventId);
    if (!event) throw new NotFoundError(`Event '${booking.eventId}' not found.`);

    if (event.status === 'Cancelled') {
      throw new ValidationError('Cannot check in tickets for a cancelled event.');
    }

    const now = command.now ? parseISODate(command.now) : new Date();
    if (now < event.startDate || now > event.endDate) {
      throw new ValidationError('Check-in is only allowed within the event time window.');
    }

    booking.checkInTicket(command.ticketId, now);
    await this.bookingRepository.save(booking);
    return toBookingDTO(booking);
  }
}
