import express from 'express';
import { actorContextMiddleware } from './middlewares/ActorContextMiddleware';
import { errorHandlerMiddleware } from './middlewares/ErrorHandlerMiddleware';
import { createRootRouter } from './routes/index';

export const createHttpServer = (container: any) => {
  const app = express();

  app.use(express.json());
  app.use(actorContextMiddleware);
  app.use('/api', createRootRouter(container));
  app.use(errorHandlerMiddleware);

  return app;
};
