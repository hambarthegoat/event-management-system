import type { BookingDTO, ExpireBookingRequestDTO } from '../../dtos';
import type { IBookingRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError } from '../common/ApplicationErrors';
import { parseISODate } from '../common/DateUtils';
import { toBookingDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-11 Expire Booking */
export class ExpireBookingCommandHandler
  implements ICommandHandler<ExpireBookingRequestDTO, BookingDTO>
{
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(command: ExpireBookingRequestDTO): Promise<BookingDTO> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) throw new NotFoundError(`Booking '${command.bookingId}' not found.`);

    const now = command.now ? parseISODate(command.now) : new Date();
    booking.expire(now);
    await this.bookingRepository.save(booking);
    return toBookingDTO(booking);
  }
}
