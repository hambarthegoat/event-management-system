import { randomUUID } from 'crypto';
import type { CreateTicketCategoryRequestDTO, EventDTO } from '../../dtos';
import { TicketCategory } from '../../../domain/aggregates/Event';
import { Money } from '../../../domain/value-objects/Money';
import type { IEventRepository } from '../../../domain/repositories/Interfaces';
import type { ICommandHandler } from '../common/Command';
import { NotFoundError } from '../common/ApplicationErrors';
import { parseISODate } from '../common/DateUtils';
import { toEventDTO } from '../common/Mappers';

/** Case study mapping (docs/case.md): US-4 Create Ticket Category */
export class CreateTicketCategoryCommandHandler
  implements ICommandHandler<CreateTicketCategoryRequestDTO, EventDTO>
{
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CreateTicketCategoryRequestDTO): Promise<EventDTO> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) throw new NotFoundError(`Event '${command.eventId}' not found.`);

    const category = new TicketCategory(randomUUID(), {
      name: command.name,
      price: Money.of(command.price.amount, command.price.currency),
      quota: command.quota,
      salesStartDate: parseISODate(command.salesStartDate),
      salesEndDate: parseISODate(command.salesEndDate),
    });

    event.addTicketCategory(category);
    await this.eventRepository.save(event);
    return toEventDTO(event);
  }
}
