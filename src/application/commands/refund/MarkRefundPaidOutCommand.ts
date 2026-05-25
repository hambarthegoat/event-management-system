import type { MarkRefundPaidOutRequestDTO, RefundDTO } from '../../dtos';
import type { IBookingRepository, IRefundRepository } from '../../../domain/repositories/Interfaces';
import type { IRefundPaymentService } from '../../interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError } from '../common/ApplicationErrors';
import { toRefundDTO, toMoneyDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-18 Mark Refund as Paid Out */
export class MarkRefundPaidOutCommandHandler
  implements ICommandHandler<MarkRefundPaidOutRequestDTO, RefundDTO>
{
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly refundRepository: IRefundRepository,
    private readonly refundPaymentService: IRefundPaymentService,
  ) {}

  async execute(command: MarkRefundPaidOutRequestDTO): Promise<RefundDTO> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) throw new NotFoundError(`Refund '${command.refundId}' not found.`);

    const booking = await this.bookingRepository.findById(refund.bookingId);
    if (!booking) throw new NotFoundError(`Booking '${refund.bookingId}' not found.`);

    const payout = await this.refundPaymentService.payout({
      refundId: refund.id,
      bookingId: booking.id,
      customerId: booking.customerId,
      amount: toMoneyDTO(refund.amount),
    });

    refund.markPaidOut(command.paymentReference || payout.payoutReference);
    await this.refundRepository.save(refund);

    return toRefundDTO(refund);
  }
}
