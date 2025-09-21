import { Router } from "express";
import { roles } from "../utils/dictionary";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import {
  createContribution,
  deleteContribution,
  getContributionById,
  getContributions,
  updateContribution,
} from "../controllers/contribution.controller";
import {
  contributionFilterSchema,
  contributionInputSchema,
} from "../schemas/contribution.schemas";
import { validateBody } from "../middleware/validate";

const contributionRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([
    roles.admin.id,
    roles.coordinator_general.id,
    roles.coordinator.id,
  ]),
];

contributionRouter.get("/:id", ...adminAuth, getContributionById);
contributionRouter.post(
  "/getAll",
  ...adminAuth,
  validateBody(contributionFilterSchema),
  getContributions
);
contributionRouter.post(
  "/",
  ...adminAuth,
  validateBody(contributionInputSchema),
  createContribution
);
contributionRouter.put(
  "/",
  ...adminAuth,
  validateBody(contributionInputSchema.partial()),
  updateContribution
);
contributionRouter.delete("/:id", ...adminAuth, deleteContribution);

export default contributionRouter;
