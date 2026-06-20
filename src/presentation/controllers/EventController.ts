import type { Request, Response } from 'express';
import type {
  CreateEventRequestDTO,
  CreateTicketCategoryRequestDTO,
  EventDTO,
} from '../../application/dtos';
import type { CreateEventCommandHandler } from '../../application/commands/event/CreateEventCommand';
import type { PublishEventCommandHandler } from '../../application/commands/event/PublishEventCommand';
import type { CancelEventCommandHandler } from '../../application/commands/event/CancelEventCommand';
import type { CreateTicketCategoryCommandHandler } from '../../application/commands/event/CreateTicketCategoryCommand';
import type { DisableTicketCategoryCommandHandler } from '../../application/commands/event/DisableTicketCategoryCommand';

export class EventController {
  constructor(
    private readonly createEventCommand: CreateEventCommandHandler,
    private readonly publishEventCommand: PublishEventCommandHandler,
    private readonly cancelEventCommand: CancelEventCommandHandler,
    private readonly createTicketCategoryCommand: CreateTicketCategoryCommandHandler,
    private readonly disableTicketCategoryCommand: DisableTicketCategoryCommandHandler,
  ) {}

  public createEvent = async (req: Request, res: Response): Promise<void> => {
    const payload: CreateEventRequestDTO = {
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      maxCapacity: req.body.maxCapacity,
      organizerId: req.body.organizerId,
    };

    const event = await this.createEventCommand.execute(payload);
    res.status(201).json(event);
  };

  public publishEvent = async (req: Request, res: Response): Promise<void> => {
    const event = await this.publishEventCommand.execute({
      eventId: String(req.params.eventId),
    });

    res.status(200).json(event);
  };

  public cancelEvent = async (req: Request, res: Response): Promise<void> => {
    const event = await this.cancelEventCommand.execute({
      eventId: String(req.params.eventId),
    });

    res.status(200).json(event);
  };

  public createTicketCategory = async (req: Request, res: Response): Promise<void> => {
    const payload: CreateTicketCategoryRequestDTO = {
      eventId: String(req.params.eventId),
      name: req.body.name,
      price: req.body.price,
      quota: req.body.quota,
      salesStartDate: req.body.salesStartDate,
      salesEndDate: req.body.salesEndDate,
    };

    const event = await this.createTicketCategoryCommand.execute(payload);
    res.status(201).json(event);
  };

  public disableTicketCategory = async (req: Request, res: Response): Promise<void> => {
    const event = await this.disableTicketCategoryCommand.execute({
      eventId: String(req.params.eventId),
      categoryId: String(req.params.categoryId),
    });

    res.status(200).json(event);
  };
}
