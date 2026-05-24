import type { EventDTO, PublishEventRequestDTO } from '../../dtos';
import type { IEventRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError } from '../common/ApplicationErrors';
import { toEventDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-2 Publish Event */
export class PublishEventCommandHandler
  implements ICommandHandler<PublishEventRequestDTO, EventDTO>
{
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: PublishEventRequestDTO): Promise<EventDTO> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) throw new NotFoundError(`Event '${command.eventId}' not found.`);

    event.publish();
    await this.eventRepository.save(event);
    return toEventDTO(event);
  }
}
