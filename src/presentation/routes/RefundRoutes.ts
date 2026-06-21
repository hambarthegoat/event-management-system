import express, { Router } from 'express';
import { RefundController } from '../controllers/RefundController';
import { requireRole } from '../middlewares/ActorContextMiddleware';

export const createRefundRouter = (container: any): Router => {
  const router = express.Router();
  const controller = new RefundController(container);

  router.post('/:refundId/approve', requireRole('EventOrganizer'), controller.approveRefund);
  router.post('/:refundId/reject', requireRole('EventOrganizer'), controller.rejectRefund);
  router.post('/:refundId/payout', requireRole('Admin', 'System'), controller.markRefundPaidOut);

  return router;
};
