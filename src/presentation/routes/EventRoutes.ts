import express, { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { requireRole } from '../middlewares/ActorContextMiddleware';

export const createEventRouter = (container: any): Router => {
  const router = express.Router();
  const controller = new EventController(
    container.createEventCommand,
    container.publishEventCommand,
    container.cancelEventCommand,
    container.createTicketCategoryCommand,
    container.disableTicketCategoryCommand,
    container.getPublishedEventsQuery,
    container.getEventDetailQuery,
  );

  router.post('/', requireRole('EventOrganizer'), controller.createEvent);
  router.post('/:eventId/publish', requireRole('EventOrganizer'), controller.publishEvent);
  router.post('/:eventId/cancel', requireRole('EventOrganizer'), controller.cancelEvent);
  router.post('/:eventId/ticket-categories', requireRole('EventOrganizer'), controller.createTicketCategory);
  router.patch('/:eventId/ticket-categories/:categoryId/disable', requireRole('EventOrganizer'), controller.disableTicketCategory);
  router.get('/', controller.listPublishedEvents);
  router.get('/:eventId', controller.getEventDetail);

  return router;
};
