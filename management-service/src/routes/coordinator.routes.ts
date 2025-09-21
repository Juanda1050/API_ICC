import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import {
  getCoordinators,
  updateCoordinator,
} from "../controllers/coordinator.controller";
import { validateBody } from "../middleware/validate";
import { roles } from "../utils/dictionary";
import { coordinatorInputSchema } from "../schemas/coordinator.schemas";

const coordinatorRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([roles.admin.id, roles.coordinator_general.id]),
];

coordinatorRouter.get("/", ...adminAuth, getCoordinators);
coordinatorRouter.put(
  "/",
  ...adminAuth,
  validateBody(coordinatorInputSchema),
  updateCoordinator
);

export default coordinatorRouter;
