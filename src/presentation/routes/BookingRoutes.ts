import express, { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { RefundController } from '../controllers/RefundController';
import { requireRole } from '../middlewares/ActorContextMiddleware';

export const createBookingRouter = (container: any): Router => {
  const router = express.Router();
  const controller = new BookingController(container);
  const refundController = new RefundController(container);

  router.post('/', requireRole('Customer'), controller.createBooking);
  router.post('/:bookingId/pay', requireRole('Customer'), controller.payBooking);

  // This expiry endpoint is exposed manually here because no job scheduler exists in this project yet.
  router.post('/:bookingId/expire', requireRole('Admin', 'System'), controller.expireBooking);

  // Customer can request a refund for a booking
  router.post('/:bookingId/refund-requests', requireRole('Customer'), refundController.requestRefund);

  return router;
};
