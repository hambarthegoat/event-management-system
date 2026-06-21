import type { Request, Response } from 'express';
import type {
  RefundDTO,
  RequestRefundRequestDTO,
  ApproveRefundRequestDTO,
  RejectRefundRequestDTO,
  MarkRefundPaidOutRequestDTO,
} from '../../application/dtos';
import type { RequestRefundCommandHandler } from '../../application/commands/refund/RequestRefundCommand';
import type { ApproveRefundCommandHandler } from '../../application/commands/refund/ApproveRefundCommand';
import type { RejectRefundCommandHandler } from '../../application/commands/refund/RejectRefundCommand';
import type { MarkRefundPaidOutCommandHandler } from '../../application/commands/refund/MarkRefundPaidOutCommand';

export class RefundController {
  private readonly requestRefundCommand: RequestRefundCommandHandler;
  private readonly approveRefundCommand: ApproveRefundCommandHandler;
  private readonly rejectRefundCommand: RejectRefundCommandHandler;
  private readonly markRefundPaidOutCommand: MarkRefundPaidOutCommandHandler;

  constructor(container: any) {
    this.requestRefundCommand = container.requestRefundCommand;
    this.approveRefundCommand = container.approveRefundCommand;
    this.rejectRefundCommand = container.rejectRefundCommand;
    this.markRefundPaidOutCommand = container.markRefundPaidOutCommand;
  }

  public requestRefund = async (req: Request, res: Response): Promise<void> => {
    const payload: RequestRefundRequestDTO = {
      bookingId: String(req.params.bookingId),
    };

    const refund = await this.requestRefundCommand.execute(payload);
    res.status(201).json(refund);
  };

  public approveRefund = async (req: Request, res: Response): Promise<void> => {
    const payload: ApproveRefundRequestDTO = {
      refundId: String(req.params.refundId),
    };

    const refund = await this.approveRefundCommand.execute(payload);
    res.status(200).json(refund);
  };

  public rejectRefund = async (req: Request, res: Response): Promise<void> => {
    const payload: RejectRefundRequestDTO = {
      refundId: String(req.params.refundId),
      reason: req.body.reason,
    };

    const refund = await this.rejectRefundCommand.execute(payload);
    res.status(200).json(refund);
  };

  public markRefundPaidOut = async (req: Request, res: Response): Promise<void> => {
    const payload: MarkRefundPaidOutRequestDTO = {
      refundId: String(req.params.refundId),
      paymentReference: req.body.paymentReference,
    };

    const refund = await this.markRefundPaidOutCommand.execute(payload);
    res.status(200).json(refund);
  };
}
