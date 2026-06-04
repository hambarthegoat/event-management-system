import type { IQueryHandler } from '../common/Query';
import type { IEventRepository } from '../../../domain/repositories/Interfaces';
import type { GetPublishedEventsRequestDTO, EventListItemDTO } from '../../dtos/event';
import { toISODateString } from '../../commands/common/DateUtils';
import { toMoneyDTO } from '../../commands/common/Mappers';

export class GetPublishedEventsQuery
  implements IQueryHandler<GetPublishedEventsRequestDTO, EventListItemDTO[]> {
  constructor(private readonly eventRepository: IEventRepository) { }

  public async execute(
    query: GetPublishedEventsRequestDTO
  ): Promise<EventListItemDTO[]> {
    const events = await this.eventRepository.findAllPublished(query);

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      startDate: toISODateString(event.startDate),
      endDate: toISODateString(event.endDate),
      location: event.location,
      lowestActivePrice: event.lowestActivePrice
        ? toMoneyDTO(event.lowestActivePrice)
        : null,
    }));
  }
}
