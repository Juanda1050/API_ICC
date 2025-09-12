import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Unexpected error:", err);

  res.status(500).json({
    ok: false,
    message: "Internal server error",
  });
}
