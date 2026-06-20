declare global {
  namespace Express {
    interface Request {
      actor: {
        id: string | null;
        role: string | null;
      };
    }
  }
}

export {};
