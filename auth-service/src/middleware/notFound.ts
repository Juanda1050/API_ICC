import { Request, Response, NextFunction } from "express";

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  res.status(404).json({
    ok: false,
    message: `Route ${req.originalUrl} not found`,
  });
}
