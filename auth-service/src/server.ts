import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import accountRouter from "./routes/account.routes";

import { securityMiddleware } from "./middleware/security";
import { loggerMiddleware } from "./middleware/logger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/error";
import userRouter from "./routes/user.routes";
import { simpleCookieMiddleware } from "./middleware/simpleCookie";

const app: Application = express();

app.use(securityMiddleware);
app.use(simpleCookieMiddleware);
app.use(loggerMiddleware);

app.get("/health", (_, res) =>
  res.json({ ok: true, service: "Auth Service is healthy" })
);

app.use("/account", accountRouter);
app.use("/user", userRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.AUTH_PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set.");
  process.exit(1);
}

app.listen(PORT, async () => {
  console.log(`Auth Service running on port ${PORT}`);
});

export default app;
