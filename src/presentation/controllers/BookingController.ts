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

export class BookingController {
  private readonly createBookingCommand: CreateBookingCommandHandler;
  private readonly payBookingCommand: PayBookingCommandHandler;
  private readonly expireBookingCommand: ExpireBookingCommandHandler;

  constructor(container: any) {
    this.createBookingCommand = container.createBookingCommand;
    this.payBookingCommand = container.payBookingCommand;
    this.expireBookingCommand = container.expireBookingCommand;
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
}
