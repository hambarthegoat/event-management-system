import { prisma, PrismaEventRepository, PrismaBookingRepository, PrismaRefundRepository, DummyPaymentGateway, DummyRefundPaymentService, ConsoleNotificationService } from '../infrastructure';

// Commands - Event
import { CreateEventCommandHandler } from '../application/commands/event/CreateEventCommand';
import { PublishEventCommandHandler } from '../application/commands/event/PublishEventCommand';
import { CancelEventCommandHandler } from '../application/commands/event/CancelEventCommand';
import { CreateTicketCategoryCommandHandler } from '../application/commands/event/CreateTicketCategoryCommand';
import { DisableTicketCategoryCommandHandler } from '../application/commands/event/DisableTicketCategoryCommand';

// Commands - Booking
import { CreateBookingCommandHandler } from '../application/commands/booking/CreateBookingCommand';
import { CheckInTicketCommandHandler } from '../application/commands/booking/CheckInTicketCommand';
import { ExpireBookingCommandHandler } from '../application/commands/booking/ExpireBookingCommand';
import { PayBookingCommandHandler } from '../application/commands/booking/PayBookingCommand';

// Commands - Refund
import { RequestRefundCommandHandler } from '../application/commands/refund/RequestRefundCommand';
import { ApproveRefundCommandHandler } from '../application/commands/refund/ApproveRefundCommand';
import { RejectRefundCommandHandler } from '../application/commands/refund/RejectRefundCommand';
import { MarkRefundPaidOutCommandHandler } from '../application/commands/refund/MarkRefundPaidOutCommand';

// Queries - Event
import { GetPublishedEventsQuery } from '../application/queries/event/GetPublishedEventsQuery';
import { GetEventDetailQuery } from '../application/queries/event/GetEventDetailQuery';
import { GetEventParticipantsQuery } from '../application/queries/event/GetEventParticipantsQuery';
import { GetEventSalesReportQuery } from '../application/queries/event/GetEventSalesReportQuery';

// Queries - Booking
import { GetCustomerTicketsQuery } from '../application/queries/booking/GetCustomerTicketsQuery';

// Instantiate repositories
const eventRepository = new PrismaEventRepository(prisma);
const bookingRepository = new PrismaBookingRepository(prisma);
const refundRepository = new PrismaRefundRepository(prisma);

// Instantiate services
const paymentGateway = new DummyPaymentGateway();
const refundPaymentService = new DummyRefundPaymentService();
const notificationService = new ConsoleNotificationService();

// Instantiate command handlers
const createEventCommand = new CreateEventCommandHandler(eventRepository);
const publishEventCommand = new PublishEventCommandHandler(eventRepository);
const cancelEventCommand = new CancelEventCommandHandler(eventRepository);
const createTicketCategoryCommand = new CreateTicketCategoryCommandHandler(eventRepository);
const disableTicketCategoryCommand = new DisableTicketCategoryCommandHandler(eventRepository);
const createBookingCommand = new CreateBookingCommandHandler(eventRepository, bookingRepository);
const checkInTicketCommand = new CheckInTicketCommandHandler(bookingRepository, eventRepository);
const expireBookingCommand = new ExpireBookingCommandHandler(bookingRepository);
const payBookingCommand = new PayBookingCommandHandler(bookingRepository, paymentGateway);
const requestRefundCommand = new RequestRefundCommandHandler(bookingRepository, eventRepository, refundRepository);
const approveRefundCommand = new ApproveRefundCommandHandler(bookingRepository, refundRepository);
const rejectRefundCommand = new RejectRefundCommandHandler(refundRepository);
const markRefundPaidOutCommand = new MarkRefundPaidOutCommandHandler(bookingRepository, refundRepository, refundPaymentService);

// Instantiate query handlers
const getPublishedEventsQuery = new GetPublishedEventsQuery(eventRepository);
const getEventDetailQuery = new GetEventDetailQuery(eventRepository);
const getEventParticipantsQuery = new GetEventParticipantsQuery(eventRepository, bookingRepository);
const getEventSalesReportQuery = new GetEventSalesReportQuery(eventRepository, bookingRepository);
const getCustomerTicketsQuery = new GetCustomerTicketsQuery(bookingRepository);

export const container = {
  repositories: {
    eventRepository,
    bookingRepository,
    refundRepository,
  },
  services: {
    paymentGateway,
    refundPaymentService,
    notificationService,
  },
  createEventCommand,
  publishEventCommand,
  cancelEventCommand,
  createTicketCategoryCommand,
  disableTicketCategoryCommand,
  createBookingCommand,
  checkInTicketCommand,
  expireBookingCommand,
  payBookingCommand,
  requestRefundCommand,
  approveRefundCommand,
  rejectRefundCommand,
  markRefundPaidOutCommand,
  getPublishedEventsQuery,
  getEventDetailQuery,
  getEventParticipantsQuery,
  getEventSalesReportQuery,
  getCustomerTicketsQuery,
};
