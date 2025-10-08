import cors from "cors";
import helmet from "helmet";
import express from "express";

export const securityMiddleware = [
  helmet(),
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-skip-auth-refresh"],
    exposedHeaders: ["set-cookie"],
  }),
  express.json({ limit: "10kb" }),
];
