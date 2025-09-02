import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import { authenticate, authorize } from "./middleware/auth";

dotenv.config();

const app = express();

app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);

app.use(
  "/billing",
  authenticate,
  createProxyMiddleware({
    target: process.env.BILLING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/billing": "" },
  })
);

app.use(
  "/management",
  authenticate,
  authorize(["admin", "coordinator"]),
  createProxyMiddleware({
    target: process.env.MANAGEMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/management": "" },
  })
);

app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});
