import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.ts';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[API Error] ${req.method} ${req.url}:`, message);

  const responseBody: any = {
    success: false,
    message,
  };

  if (env.NODE_ENV === 'development' && err.stack) {
    responseBody.stack = err.stack;
  }

  return res.status(statusCode).json(responseBody);
}
