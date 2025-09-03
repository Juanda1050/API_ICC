import express from "express";
import dotenv from "dotenv";
import router from "./routes/auth.routes";
import { seedRoles } from "./scripts/seed";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", router);
app.get("/health", (_, res) =>
  res.json({ ok: true, service: "Auth Service is healthy" })
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Auth Service running on port ${PORT}`);
});
