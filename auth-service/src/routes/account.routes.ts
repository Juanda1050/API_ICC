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
import { registerSchema, loginSchema } from "../schemas/account.schema";

const accountRouter = Router();

accountRouter.get("/health", healthCheck);
accountRouter.post("/register", validateBody(registerSchema), register);
accountRouter.post("/login", validateBody(loginSchema), login);
accountRouter.post("/refresh", refresh);
accountRouter.post("/logout", authenticateMiddleware, logout);

export default accountRouter;
