import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorMiddleware = (
  err: Error, _req: Request, res: Response, _next: NextFunction
) => {
  console.error(err);
  return sendError(res, err.message || 'Internal server error', 500);
};