import type { IQueryHandler } from '../common/Query';
import type { IEventRepository, IBookingRepository } from '../../../domain/repositories/Interfaces';
import { NotFoundError } from '../../commands/common/ApplicationErrors';
import { toMoneyDTO } from '../../commands/common/Mappers';
import type { GetEventSalesReportRequestDTO, EventSalesReportDTO, TicketCategorySalesDTO } from '../../dtos/event';
import { BookingStatus } from '../../../domain/aggregates/Booking';
import { Money } from '../../../domain/value-objects/Money';

export class GetEventSalesReportQuery
  implements IQueryHandler<GetEventSalesReportRequestDTO, EventSalesReportDTO> {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly bookingRepository: IBookingRepository
  ) { }

  public async execute(
    query: GetEventSalesReportRequestDTO
  ): Promise<EventSalesReportDTO> {
    const event = await this.eventRepository.findById(query.eventId);
    if (!event) {
      throw new NotFoundError(`Event with id '${query.eventId}' not found.`);
    }

    const bookings = await this.bookingRepository.findByEventId(query.eventId);

    const categorySales: TicketCategorySalesDTO[] = [];
    for (const category of event.categories) {
      if (category.isActive) {
        const categoryBookings = bookings.filter(
          (b) => b.categoryId === category.id && b.status === BookingStatus.Paid
        );
        const ticketsSold = categoryBookings.reduce(
          (sum, b) => sum + b.quantity,
          0
        );

        categorySales.push({
          categoryId: category.id,
          categoryName: category.name,
          ticketsSold,
        });
      }
    }

    const bookingCountByStatus = {
      PendingPayment: bookings.filter(
        (b) => b.status === BookingStatus.PendingPayment
      ).length,
      Paid: bookings.filter((b) => b.status === BookingStatus.Paid).length,
      Expired: bookings.filter((b) => b.status === BookingStatus.Expired).length,
      Refunded: bookings.filter((b) => b.status === BookingStatus.Refunded)
        .length,
    };

    let totalRevenueMoney = Money.of(0, 'IDR');
    for (const booking of bookings) {
      if (booking.status === BookingStatus.Paid) {
        totalRevenueMoney = totalRevenueMoney.add(booking.totalPrice);
      }
    }

    return {
      eventId: event.id,
      categorySales,
      bookingCountByStatus,
      totalRevenue: toMoneyDTO(totalRevenueMoney),
    };
  }
}
