import cors from "cors";
import helmet from "helmet";
import express from "express";

export const securityMiddleware = [
  helmet(),
  cors({ origin: process.env.CORS_ORIGIN || "*" }),
  express.json({ limit: "10kb" }),
];
