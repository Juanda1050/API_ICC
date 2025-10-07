import { Request, Response, NextFunction } from "express";

export function simpleCookieMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.cookie;
  const cookies: Record<string, string> = {};

  if (header) {
    header.split(";").forEach((pair) => {
      const index = pair.indexOf("=");
      if (index > -1) {
        const key = pair.slice(0, index).trim();
        const val = pair.slice(index + 1).trim();
        cookies[decodeURIComponent(key)] = decodeURIComponent(val);
      }
    });
  }

  (req as Request & { cookies?: Record<string, string> }).cookies = cookies;
  next();
}
