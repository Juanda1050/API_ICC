import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { error } from "../utils/response";

const JWT_SECRET = process.env.JWT_SECRET || "";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    error(res, "Authorization header missing", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoced = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoced;
    next();
  } catch (err) {
    error(res, "Invalid or expired token", 401);
  }
}
