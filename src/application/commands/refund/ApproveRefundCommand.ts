import type { ApproveRefundRequestDTO, RefundDTO } from '../../dtos';
import type { IBookingRepository, IRefundRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError } from '../common/ApplicationErrors';
import { toRefundDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-16 Approve Refund */
export class ApproveRefundCommandHandler
  implements ICommandHandler<ApproveRefundRequestDTO, RefundDTO>
{
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly refundRepository: IRefundRepository,
  ) {}

  async execute(command: ApproveRefundRequestDTO): Promise<RefundDTO> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) throw new NotFoundError(`Refund '${command.refundId}' not found.`);

    const booking = await this.bookingRepository.findById(refund.bookingId);
    if (!booking) throw new NotFoundError(`Booking '${refund.bookingId}' not found.`);

    refund.approve();
    booking.markRefunded();

    await this.bookingRepository.save(booking);
    await this.refundRepository.save(refund);

    return toRefundDTO(refund);
  }
}
