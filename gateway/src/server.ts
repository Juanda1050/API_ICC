import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  "/billing",
  createProxyMiddleware({
    target: process.env.BILLING_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  "/management",
  createProxyMiddleware({
    target: process.env.MANAGEMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/management": "" },
  })
);

const port = Number(process.env.GATEWAY_PORT) || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${port}`);
});