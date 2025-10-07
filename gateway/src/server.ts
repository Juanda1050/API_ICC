import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import { authenticate } from "./middleware/auth";
import { securityMiddleware } from "./middleware/security";
import { corsProxyHeaders } from "./middleware/proxyHeaders";
import { simpleCookieMiddleware } from "./middleware/simpleCookie";

dotenv.config();

const app = express();

app.use(securityMiddleware);
app.use(simpleCookieMiddleware);

app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    onProxyRes: corsProxyHeaders,
  } as any)
);

app.use(
  "/billing",
  authenticate,
  createProxyMiddleware({
    target: process.env.BILLING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/billing": "" },
    onProxyRes: corsProxyHeaders,
  } as any)
);

app.use(
  "/management",
  authenticate,
  createProxyMiddleware({
    target: process.env.MANAGEMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/management": "" },
    onProxyRes: corsProxyHeaders,
  } as any)
);

app.listen(process.env.GATEWAY_PORT, () => {
  console.log(`API Gateway running on port ${process.env.GATEWAY_PORT}`);
});
