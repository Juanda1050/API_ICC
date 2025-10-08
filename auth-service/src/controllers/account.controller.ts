import { Request, Response } from "express";
import {
  clearRefreshCookie,
  error,
  success,
  successWithRefreshCookie,
} from "../utils/response";
import {
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
} from "../services/account.service";
import pkg from "../../package.json";
import { IUserRegisterRequest } from "../types/account.types";
import { parseCookieHeader } from "../utils/cookies";

export async function register(req: Request, res: Response) {
  try {
    const { name, lastName, email, password, telephone, schoolGroup_id } =
      req.body;
    if (!email || !password)
      return error(res, "Email and password are required", 400);

    const userToRegister: IUserRegisterRequest = {
      name,
      lastName,
      email,
      password,
      telephone,
      schoolGroup_id,
    };

    const user = await registerService(userToRegister);
    return success(res, user, 201);
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return error(res, "Email and password are required", 400);

    const { accessToken, refreshToken, user } = await loginService(
      email,
      password
    );
    return successWithRefreshCookie(
      res,
      { accessToken, user },
      refreshToken,
      200
    );
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function refresh(req: Request, res: Response) {
  const cookies = parseCookieHeader(req.headers.cookie);
  const oldRefreshToken = cookies["rt"];

  if (!oldRefreshToken) {
    return error(res, "No refresh token", 401);
  }

  try {
    const {
      accessToken,
      refreshToken: newRefreshToken,
      currentUser,
    } = await refreshTokenService(oldRefreshToken);
    return successWithRefreshCookie(
      res,
      {
        access_token: accessToken,
        user: currentUser,
      },
      newRefreshToken
    );
  } catch (err) {
    return error(res, "Invalid refresh token", 401);
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) return error(res, "Unauthorized", 401);

    await logoutService(userId);
    return clearRefreshCookie(res, 200);
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
