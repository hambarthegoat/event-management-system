import { randomUUID } from 'crypto';
import type { RefundDTO, RequestRefundRequestDTO } from '../../dtos';
import { Refund } from '../../../domain/aggregates/Refund';
import type { IBookingRepository, IEventRepository, IRefundRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError, ValidationError } from '../common/ApplicationErrors';
import { toRefundDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-15 Request Refund */
export class RequestRefundCommandHandler
  implements ICommandHandler<RequestRefundRequestDTO, RefundDTO>
{
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly eventRepository: IEventRepository,
    private readonly refundRepository: IRefundRepository,
  ) {}

  async execute(command: RequestRefundRequestDTO): Promise<RefundDTO> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) throw new NotFoundError(`Booking '${command.bookingId}' not found.`);

    if (booking.status !== 'Paid') {
      throw new ValidationError('A refund can only be requested for a Paid booking.');
    }
    if (booking.hasCheckedInTickets()) {
      throw new ValidationError('A refund cannot be requested if any ticket has been checked in.');
    }

    const event = await this.eventRepository.findById(booking.eventId);
    if (!event) throw new NotFoundError(`Event '${booking.eventId}' not found.`);

    const now = new Date();
    const eventCancelled = event.status === 'Cancelled';
    if (!eventCancelled && now > event.startDate) {
      // Refund deadline policy is not explicitly modeled; we treat event start as deadline.
      throw new ValidationError('Refund deadline has passed.');
    }

    const refund = Refund.request(randomUUID(), booking.id, booking.totalPrice);
    await this.refundRepository.save(refund);

    return toRefundDTO(refund);
  }
}
