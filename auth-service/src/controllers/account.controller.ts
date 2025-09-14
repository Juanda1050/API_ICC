import { Request, Response } from "express";
import { error, success } from "../utils/response";
import {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
} from "../services/account.service";
import pkg from "../../package.json";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, telephone } = req.body;
    if (!email || !password)
      return error(res, "Email and password are required", 400);

    const user = await registerUser(email, password, telephone);
    return success(
      res,
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          telephone: user.telephone,
          role_id: user.role_id,
        },
      },
      201
    );
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return error(res, "Email and password are required", 400);

    const data = await loginUser(email, password);
    return success(res, data);
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken: oldRefreshToken } = req.body;
    if (!oldRefreshToken) return error(res, "Refresh token is required", 400);

    const data = await refreshToken(oldRefreshToken);
    return success(res, data);
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) return error(res, "Unauthorized", 401);

    await logoutUser(userId);
    return success(res, { message: "Logged out successfully" });
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function healthCheck(req: Request, res: Response) {
  return success(res, {
    status: "OK",
    service: "auth-service",
    version: pkg.version,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
  });
}
