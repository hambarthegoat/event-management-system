import type { BookingDTO, PayBookingRequestDTO } from '../../dtos';
import { Money } from '../../../domain/value-objects/Money';
import type { IBookingRepository } from '../../../domain/repositories/Interfaces';
import type { IPaymentGateway } from '../../interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError, ValidationError } from '../common/ApplicationErrors';
import { parseISODate } from '../common/DateUtils';
import { toBookingDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-10 Pay Booking */
export class PayBookingCommandHandler
  implements ICommandHandler<PayBookingRequestDTO, BookingDTO>
{
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(command: PayBookingRequestDTO): Promise<BookingDTO> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) throw new NotFoundError(`Booking '${command.bookingId}' not found.`);

    const amount = Money.of(command.amount.amount, command.amount.currency);
    if (!amount.isEqualTo(booking.totalPrice)) {
      throw new ValidationError('Payment amount must equal total booking price.');
    }

    const result = await this.paymentGateway.charge({
      bookingId: booking.id,
      customerId: booking.customerId,
      amount: command.amount,
    });

    booking.pay(amount, parseISODate(result.paidAt));
    await this.bookingRepository.save(booking);

    return toBookingDTO(booking);
  }
}
