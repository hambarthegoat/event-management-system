import type { Request, Response, NextFunction } from 'express';

export const actorContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const actorId = req.headers['x-actor-id'] as string | undefined;
  const actorRole = req.headers['x-actor-role'] as string | undefined;

  req.actor = {
    id: actorId ?? null,
    role: actorRole ?? null,
  };

  next();
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.actor.role || !allowedRoles.includes(req.actor.role)) {
      res.status(403).json({
        error: {
          name: 'ForbiddenError',
          message: `Actor role ${req.actor.role} is not allowed to perform this action.`,
        },
      });
      return;
    }

    next();
  };
};
