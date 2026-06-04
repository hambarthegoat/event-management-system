import type { IQueryHandler } from '../common/Query';
import type { IEventRepository } from '../../../domain/repositories/Interfaces';
import { NotFoundError } from '../../commands/common/ApplicationErrors';
import { toEventDTO } from '../../commands/common/Mappers';
import type { GetEventDetailRequestDTO, EventDTO } from '../../dtos/event';

export class GetEventDetailQuery
  implements IQueryHandler<GetEventDetailRequestDTO, EventDTO>
{
  constructor(private readonly eventRepository: IEventRepository) {}

  public async execute(query: GetEventDetailRequestDTO): Promise<EventDTO> {
    const event = await this.eventRepository.findById(query.eventId);
    if (!event) {
      throw new NotFoundError(`Event with id '${query.eventId}' not found.`);
    }

    return toEventDTO(event);
  }
}
