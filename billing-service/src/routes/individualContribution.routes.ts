import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { roles } from "../utils/dictionary";
import {
  createIndivContribution,
  deleteIndivContribution,
  getIndivContributions,
  updateIndivContribution,
} from "../controllers/individualContribution.controller";
import { validateBody } from "../../../management-service/src/middleware/validate";
import { indivContributionInputSchema } from "../schemas/individualContribution.schemas";

const indivContributionRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([
    roles.admin.id,
    roles.coordinator_general.id,
    roles.coordinator.id,
  ]),
];

indivContributionRouter.get(
  "/:contributionId",
  ...adminAuth,
  getIndivContributions
);
indivContributionRouter.post(
  "/",
  ...adminAuth,
  validateBody(indivContributionInputSchema),
  createIndivContribution
);
indivContributionRouter.put(
  "/",
  ...adminAuth,
  validateBody(indivContributionInputSchema.partial()),
  updateIndivContribution
);
indivContributionRouter.delete("/:id", ...adminAuth, deleteIndivContribution);
