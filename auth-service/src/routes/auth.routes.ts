import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import {
  login,
  register,
  refresh,
  logout,
  healthCheck,
} from "../controllers/auth.controller";
import { z } from "zod/v3";

const router = Router();

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

router.get("/health", healthCheck);
router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.post("/logout", authenticateMiddleware, logout);

export default router;