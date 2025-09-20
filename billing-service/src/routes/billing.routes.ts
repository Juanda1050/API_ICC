import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { roles } from "../utils/dictionary";
import { validateBody } from "../../../management-service/src/middleware/validate";
import {
  createBilling,
  deleteBilling,
  getEventBillings,
} from "../controllers/billing.controller";
import { billingInputSchema } from "../schemas/billing.schemas";

const billingRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([
    roles.admin.id,
    roles.coordinator_general.id,
    roles.coordinator.id,
  ]),
];

billingRouter.post(
  "/",
  ...adminAuth,
  validateBody(billingInputSchema),
  createBilling
);
billingRouter.get("/:eventId", ...adminAuth, getEventBillings);
billingRouter.put(
  "/:id",
  ...adminAuth,
  validateBody(billingInputSchema.partial())
);
billingRouter.delete("/:id", ...adminAuth, deleteBilling);

export default billingRouter;
