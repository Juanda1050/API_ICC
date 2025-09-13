import { NextFunction, Request, Response } from "express";
import { error } from "../utils/response";

export function authorizeMiddleware(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) return error(res, "Unauthorized", 401);
    console.log(user)

    if (!roles.includes(user.roleId)) return error(res, "Forbidden", 403);

    next();
  };
}
