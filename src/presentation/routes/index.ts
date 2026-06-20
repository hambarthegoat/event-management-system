import express, { Router } from 'express';

export const createRootRouter = (container: any): Router => {
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Feature routers will be mounted here in later commits

  return router;
};
