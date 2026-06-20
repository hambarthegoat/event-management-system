import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, ConflictError, ValidationError } from '../../application/commands/common/ApplicationErrors';
import { DomainException } from '../../domain/exceptions/DomainExceptions';

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let statusCode = 500;

  if (err instanceof NotFoundError) {
    statusCode = 404;
  } else if (err instanceof ConflictError) {
    statusCode = 409;
  } else if (err instanceof ValidationError) {
    statusCode = 400;
  } else if (err instanceof DomainException) {
    statusCode = 400;
  } else {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      name: err.name,
      message: err.message,
    },
  });
};
