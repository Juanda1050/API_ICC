import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import authRouter from "./routes/auth.routes";

import { securityMiddleware } from "./middleware/security";
import { loggerMiddleware } from "./middleware/logger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import userRouter from "./routes/user.routes";

const app: Application = express();

app.use(securityMiddleware);
app.use(loggerMiddleware);

app.get("/health", (_, res) =>
  res.json({ ok: true, service: "Auth Service is healthy" })
);

app.use("/auth", authRouter);
app.use("/user", userRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set.");
  process.exit(1);
}

app.listen(PORT, async () => {
  console.log(`Auth Service running on port ${PORT}`);
});

export default app;
