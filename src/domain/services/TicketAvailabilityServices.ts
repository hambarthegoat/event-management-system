import { Event, TicketCategory } from '../aggregates/Event';
import { InvalidStateException } from '../exceptions/DomainExceptions';
import type { IBookingRepository } from '../repositories/Interfaces';

export class TicketAvailabilityService {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  public async getRemainingQuota(
    event: Event,
    categoryId: string,
  ): Promise<number> {
    const category = this.findActiveCategoryOrThrow(event, categoryId);
    const reserved = await this.bookingRepository.countActiveByCategory(categoryId);
    return category.quota - reserved;
  }

  public async assertQuotaAvailable(
    event: Event,
    categoryId: string,
    requestedQty: number,
  ): Promise<void> {
    const remaining = await this.getRemainingQuota(event, categoryId);
    if (remaining < requestedQty) {
      throw new InvalidStateException(
        `Not enough tickets available. Requested: ${requestedQty}, Remaining: ${remaining}.`,
      );
    }
  }

  private findActiveCategoryOrThrow(event: Event, categoryId: string): TicketCategory {
    const category = event.findCategory(categoryId);
    if (!category) {
      throw new InvalidStateException(
        `Ticket category '${categoryId}' does not exist in event '${event.id}'.`,
      );
    }
    if (!category.isActive) {
      throw new InvalidStateException(
        `Ticket category '${categoryId}' is disabled and not available for purchase.`,
      );
    }
    return category;
  }
}