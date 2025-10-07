import { Response } from "express";

const isProd = process.env.NODE_ENV === "production";

const REFRESH_COOKIE_NAME = "rt";
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/auth",
};

export function success(res: Response, data: any, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function error(res: Response, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export function successWithRefreshCookie(
  res: Response,
  data: any,
  refreshToken: string,
  status = 200
) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  return success(res, data, status);
}

export function clearRefreshCookie(res: Response, status = 200) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: refreshCookieOptions.path });
  return success(res, { cleared: true }, status);
}
