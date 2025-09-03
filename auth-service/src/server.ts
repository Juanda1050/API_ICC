import express from "express";
import dotenv from "dotenv";
import router from "./routes/auth.routes";
import { securityMiddleware } from "./middleware/security";
import { loggerMiddleware } from "./middleware/logger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(securityMiddleware);
app.use(loggerMiddleware);

app.use("/auth", router);
app.get("/health", (_, res) =>
  res.json({ ok: true, service: "Auth Service is healthy" })
);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Auth Service running on port ${PORT}`);
});
