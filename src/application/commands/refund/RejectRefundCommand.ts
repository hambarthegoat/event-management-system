import type { RejectRefundRequestDTO, RefundDTO } from '../../dtos';
import type { IRefundRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError } from '../common/ApplicationErrors';
import { toRefundDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-17 Reject Refund */
export class RejectRefundCommandHandler
  implements ICommandHandler<RejectRefundRequestDTO, RefundDTO>
{
  constructor(private readonly refundRepository: IRefundRepository) {}

  async execute(command: RejectRefundRequestDTO): Promise<RefundDTO> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) throw new NotFoundError(`Refund '${command.refundId}' not found.`);

    refund.reject(command.reason);
    await this.refundRepository.save(refund);

    return toRefundDTO(refund);
  }
}
