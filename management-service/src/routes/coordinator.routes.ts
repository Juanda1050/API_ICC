import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import {
  getCoordinators,
  updateCoordinator,
} from "../controllers/coordinator.controller";
import z from "zod/v3";
import { validateBody } from "../middleware/validate";

const coordinatorRouter = Router();

const updateCoordinatorSchema = z.object({
  email: z.string().optional(),
  telephone: z.string().optional(),
  role_id: z.string().min(1, "Role is required"),
});

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware(["admin", "coordinator_general"]),
];

coordinatorRouter.get("/", ...adminAuth, getCoordinators);
coordinatorRouter.put(
  "/",
  ...adminAuth,
  validateBody(updateCoordinatorSchema),
  updateCoordinator
);

export default coordinatorRouter;
