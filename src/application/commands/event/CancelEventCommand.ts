import type { CancelEventRequestDTO, EventDTO } from '../../dtos';
import type { IEventRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError } from '../common/ApplicationErrors';
import { toEventDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-3 Cancel Event */
export class CancelEventCommandHandler
  implements ICommandHandler<CancelEventRequestDTO, EventDTO>
{
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CancelEventRequestDTO): Promise<EventDTO> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) throw new NotFoundError(`Event '${command.eventId}' not found.`);

    event.cancel();

    // AC: "all ticket categories can no longer be purchased".
    // Domain doesn't expose a dedicated method; we disable categories in-place.
    event.categories.forEach((c) => {
      if (c.isActive) c.disable();
    });

    await this.eventRepository.save(event);
    return toEventDTO(event);
  }
}
