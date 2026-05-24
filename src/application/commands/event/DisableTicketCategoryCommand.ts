import type { DisableTicketCategoryRequestDTO, EventDTO } from '../../dtos';
import type { IEventRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError } from '../common/ApplicationErrors';
import { toEventDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-5 Disable Ticket Category */
export class DisableTicketCategoryCommandHandler
  implements ICommandHandler<DisableTicketCategoryRequestDTO, EventDTO>
{
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: DisableTicketCategoryRequestDTO): Promise<EventDTO> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) throw new NotFoundError(`Event '${command.eventId}' not found.`);

    event.disableTicketCategory(command.categoryId);
    await this.eventRepository.save(event);
    return toEventDTO(event);
  }
}
