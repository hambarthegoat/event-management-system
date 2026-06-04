import type { IQueryHandler } from '../common/Query';
import type { IEventRepository, IBookingRepository } from '../../../domain/repositories/Interfaces';
import { NotFoundError } from '../../commands/common/ApplicationErrors';
import type { GetEventParticipantsRequestDTO, EventParticipantDTO } from '../../dtos/event';
import { BookingStatus } from '../../../domain/aggregates/Booking';
import type { TicketStatusDTO } from '../../dtos/booking';

export class GetEventParticipantsQuery
  implements IQueryHandler<GetEventParticipantsRequestDTO, EventParticipantDTO[]> {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly bookingRepository: IBookingRepository
  ) { }

  public async execute(
    query: GetEventParticipantsRequestDTO
  ): Promise<EventParticipantDTO[]> {
    const event = await this.eventRepository.findById(query.eventId);
    if (!event) {
      throw new NotFoundError(`Event with id '${query.eventId}' not found.`);
    }

    const bookings = await this.bookingRepository.findByEventId(query.eventId);

    const paidBookings = bookings.filter((b) => b.status === BookingStatus.Paid);

    const participants: EventParticipantDTO[] = [];
    for (const booking of paidBookings) {
      const category = event.categories.find(
        (c) => c.id === booking.categoryId
      );

      for (const ticket of booking.tickets) {
        participants.push({
          customerId: booking.customerId,
          ticketCategoryName: category?.name ?? 'Unknown',
          ticketCode: ticket.code.value,
          ticketStatus: ticket.status as unknown as TicketStatusDTO,
        });
      }
    }

    return participants;
  }
}
