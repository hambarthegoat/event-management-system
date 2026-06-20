import express, { Router } from 'express';
import { createEventRouter } from './EventRoutes';
import { createBookingRouter } from './BookingRoutes';

export const createRootRouter = (container: any): Router => {
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  router.use('/events', createEventRouter(container));
  router.use('/bookings', createBookingRouter(container));

  // Feature routers will be mounted here in later commits

  return router;
};
