import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import stockRouter from "./routes/stock.routes";
import eventRouter from "./routes/event.routes";
import contributionRouter from "./routes/contribution.routes";
import indivContributionRouter from "./routes/individualContribution.routes";

import { securityMiddleware } from "./middleware/security";
import { loggerMiddleware } from "./middleware/logger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/error";

const app: Application = express();

app.use(securityMiddleware);
app.use(loggerMiddleware);

app.get("/health", (_, res) =>
  res.json({ ok: true, service: "Billing Service is healthy" })
);

app.use("/stock", stockRouter);
app.use("/event", eventRouter);
app.use("/contribution", contributionRouter);
app.use("/indivContribution", indivContributionRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.BILLING_PORT || 4001;

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set.");
  process.exit(1);
}

app.listen(PORT, async () => {
  console.log(`Billing Service running on port ${PORT}`);
});

export default app;
