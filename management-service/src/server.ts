import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import studentRouter from "./routes/student.routes";
import teacherRouter from "./routes/teacher.routes";
import coordinatorRouter from "./routes/coordinator.routes";

import { securityMiddleware } from "./middleware/security";
import { loggerMiddleware } from "./middleware/logger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/error";

const app: Application = express();

app.use(securityMiddleware);
app.use(loggerMiddleware);

app.get("/health", (_, res) =>
  res.json({ ok: true, service: "Management Service is healthy" })
);

app.use("/student", studentRouter);
app.use("/teacher", teacherRouter);
app.use("/coordinator", coordinatorRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4002;

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set.");
  process.exit(1);
}

app.listen(PORT, async () => {
  console.log(`Auth Service running on port ${PORT}`);
});

export default app;
