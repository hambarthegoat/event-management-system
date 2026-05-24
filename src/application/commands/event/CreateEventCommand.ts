import { randomUUID } from 'crypto';
import type { CreateEventRequestDTO, EventDTO } from '../../dtos';
import { Event } from '../../../domain/aggregates/Event';
import type { IEventRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { parseISODate } from '../common/DateUtils';
import { toEventDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-1 Create Event */
export class CreateEventCommandHandler
  implements ICommandHandler<CreateEventRequestDTO, EventDTO>
{
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CreateEventRequestDTO): Promise<EventDTO> {
    const id = randomUUID();
    const event = Event.create(
      id,
      command.name,
      command.description,
      command.location,
      parseISODate(command.startDate),
      parseISODate(command.endDate),
      command.maxCapacity,
      command.organizerId,
    );

    await this.eventRepository.save(event);
    return toEventDTO(event);
  }
}
