import express, { Router } from 'express';
import { createEventRouter } from './EventRoutes';
import { createBookingRouter } from './BookingRoutes';
import { BookingController } from '../controllers/BookingController';

export const createRootRouter = (container: any): Router => {
  const router = express.Router();
  const bookingController = new BookingController(container);

  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/customers/:customerId/tickets', bookingController.getCustomerTickets);
  router.use('/events', createEventRouter(container));
  router.use('/bookings', createBookingRouter(container));

  // Feature routers will be mounted here in later commits

  return router;
};
