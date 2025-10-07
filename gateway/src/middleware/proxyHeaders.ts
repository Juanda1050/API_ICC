import { Request, Response } from "express";

export function corsProxyHeaders(proxyRes: any, req: Request, res: Response) {
  const origin = process.env.CORS_ORIGIN;

  proxyRes.headers["access-control-allow-origin"] = origin;
  proxyRes.headers["access-control-allow-credentials"] = "true";
  proxyRes.headers["access-control-expose-headers"] =
    "set-cookie, authorization";
  proxyRes.headers["access-control-allow-headers"] =
    "Content-Type, Authorization";
  proxyRes.headers["access-control-allow-methods"] =
    "GET, POST, PUT, PATCH, DELETE, OPTIONS";
}
