import cors from "cors";
import express from "express";

export const securityMiddleware = [
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
  express.json({ limit: "10kb" }),
];
