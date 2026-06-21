import type { Request, Response } from 'express';
import type {
  BookingDTO,
  CreateBookingRequestDTO,
  ExpireBookingRequestDTO,
  MoneyDTO,
  PayBookingRequestDTO,
} from '../../application/dtos';
import type { CreateBookingCommandHandler } from '../../application/commands/booking/CreateBookingCommand';
import type { PayBookingCommandHandler } from '../../application/commands/booking/PayBookingCommand';
import type { ExpireBookingCommandHandler } from '../../application/commands/booking/ExpireBookingCommand';
import type { CheckInTicketCommandHandler } from '../../application/commands/booking/CheckInTicketCommand';
import type {
  GetCustomerTicketsQuery,
  GetCustomerTicketsRequestDTO,
} from '../../application/queries/booking/GetCustomerTicketsQuery';
import type { IBookingRepository } from '../../domain/repositories/Interfaces';
import { NotFoundError, ValidationError } from '../../application/commands/common/ApplicationErrors';

export class BookingController {
  private readonly createBookingCommand: CreateBookingCommandHandler;
  private readonly payBookingCommand: PayBookingCommandHandler;
  private readonly expireBookingCommand: ExpireBookingCommandHandler;
  private readonly checkInTicketCommand: CheckInTicketCommandHandler;
  private readonly getCustomerTicketsQuery: GetCustomerTicketsQuery;
  private readonly bookingRepository: IBookingRepository;

  constructor(container: any) {
    this.createBookingCommand = container.createBookingCommand;
    this.payBookingCommand = container.payBookingCommand;
    this.expireBookingCommand = container.expireBookingCommand;
    this.checkInTicketCommand = container.checkInTicketCommand;
    this.getCustomerTicketsQuery = container.getCustomerTicketsQuery;
    this.bookingRepository = container.bookingRepository;
  }

  public createBooking = async (req: Request, res: Response): Promise<void> => {
    const payload: CreateBookingRequestDTO = {
      eventId: req.body.eventId,
      customerId: req.body.customerId,
      categoryId: req.body.categoryId,
      quantity: req.body.quantity,
    };

    const booking = await this.createBookingCommand.execute(payload);
    res.status(201).json(booking);
  };

  public payBooking = async (req: Request, res: Response): Promise<void> => {
    const payload: PayBookingRequestDTO = {
      bookingId: String(req.params.bookingId),
      amount: req.body.amount as MoneyDTO,
    };

    const booking = await this.payBookingCommand.execute(payload);
    res.status(200).json(booking);
  };

  public expireBooking = async (req: Request, res: Response): Promise<void> => {
    const payload: ExpireBookingRequestDTO = {
      bookingId: String(req.params.bookingId),
    };

    if (req.body.now) {
      payload.now = String(req.body.now);
    }

    const booking = await this.expireBookingCommand.execute(payload);
    res.status(200).json(booking);
  };

  public getCustomerTickets = async (req: Request, res: Response): Promise<void> => {
    const query: GetCustomerTicketsRequestDTO = {
      customerId: String(req.params.customerId),
    };

    const tickets = await this.getCustomerTicketsQuery.execute(query);
    res.status(200).json(tickets);
  };

  public checkInTicket = async (req: Request, res: Response): Promise<void> => {
    const eventId = String(req.params.eventId);
    const ticketCode = String(req.body.ticketCode);

    const booking = await this.bookingRepository.findByTicketCode(ticketCode);
    if (!booking) {
      throw new NotFoundError('Ticket is invalid.');
    }

    if (booking.eventId !== eventId) {
      throw new ValidationError('Ticket does not match the event.');
    }

    const ticket = booking.tickets.find((t) => t.code.value === ticketCode);
    if (!ticket) {
      throw new NotFoundError('Ticket is invalid.');
    }

    const result = await this.checkInTicketCommand.execute({
      bookingId: booking.id,
      ticketId: ticket.id,
    });

    res.status(200).json(result);
  };
}
