import type { IQueryHandler } from '../common/Query';
import type { IBookingRepository } from '../../../domain/repositories/Interfaces';
import { BookingStatus } from '../../../domain/aggregates/Booking';
import type { BookingDTO } from '../../dtos';
import { toBookingDTO } from '../../commands/common/Mappers';

export interface GetCustomerTicketsRequestDTO {
  customerId: string;
}

export class GetCustomerTicketsQuery
  implements IQueryHandler<GetCustomerTicketsRequestDTO, BookingDTO[]>
{
  constructor(private readonly bookingRepository: IBookingRepository) {}

  public async execute(
    query: GetCustomerTicketsRequestDTO
  ): Promise<BookingDTO[]> {
    const bookings = await this.bookingRepository.findByCustomerId(
      query.customerId
    );

    const paidBookings = bookings.filter((b) => b.status === BookingStatus.Paid);

    return paidBookings.map((booking) => toBookingDTO(booking));
  }
}
