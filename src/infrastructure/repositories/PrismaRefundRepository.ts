import type { Prisma, PrismaClient } from "@prisma/client";
import type { IRefundRepository } from "../../domain/repositories/Interfaces";
import { Refund } from "../../domain/aggregates/Refund";
import { Money } from "../../domain/value-objects/Money";
import { toDomainRefundStatus, toPrismaRefundStatus } from "./PrismaMappers";

type RefundRecord = Prisma.RefundGetPayload<{}>;

export class PrismaRefundRepository implements IRefundRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find a Refund by id.
   * User Stories: US-15 (Request Refund), US-16 (Approve Refund), US-17 (Reject Refund), US-18 (Mark Refund as Paid Out)
   */
  async findById(id: string): Promise<Refund | null> {
    const record = await this.prisma.refund.findUnique({
      where: { id },
    });
    if (!record) return null;
    return toDomainRefund(record);
  }

  /**
   * Persist a Refund aggregate (create or update).
   * User Stories: US-15 (Request Refund), US-16 (Approve Refund), US-17 (Reject Refund), US-18 (Mark Refund as Paid Out)
   */
  async save(refund: Refund): Promise<void> {
    await this.prisma.refund.upsert({
      where: { id: refund.id },
      create: {
        id: refund.id,
        bookingId: refund.bookingId,
        amountAmount: refund.amount.amount,
        amountCurrency: refund.amount.currency,
        status: toPrismaRefundStatus(refund.status),
        rejectionReason: refund.rejectionReason,
        paymentReference: refund.paymentReference,
      },
      update: {
        amountAmount: refund.amount.amount,
        amountCurrency: refund.amount.currency,
        status: toPrismaRefundStatus(refund.status),
        rejectionReason: refund.rejectionReason,
        paymentReference: refund.paymentReference,
      },
    });
  }
}

/**
 * Map a DB refund record to domain Refund aggregate.
 * Used by refund flows: US-15..US-18
 */
function toDomainRefund(record: NonNullable<RefundRecord>): Refund {
  return Refund.rehydrate(
    record.id,
    record.bookingId,
    Money.of(record.amountAmount, record.amountCurrency),
    toDomainRefundStatus(record.status),
    record.rejectionReason ?? undefined,
    record.paymentReference ?? undefined,
  );
}
