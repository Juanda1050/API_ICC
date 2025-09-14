import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import {
  login,
  register,
  refresh,
  logout,
  healthCheck,
} from "../controllers/account.controller";
import { z } from "zod/v3";

const accountRouter = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  telephone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

accountRouter.get("/health", healthCheck);
accountRouter.post("/register", validateBody(registerSchema), register);
accountRouter.post("/login", validateBody(loginSchema), login);
accountRouter.post("/refresh", validateBody(refreshSchema), refresh);
accountRouter.post("/logout", authenticateMiddleware, logout);

export default accountRouter;