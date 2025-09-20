import { Router } from "express";
import z from "zod/v3";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { roles } from "../utils/dictionary";
import {
  validate,
  validateBody,
} from "../../../management-service/src/middleware/validate";
import {
  createBilling,
  deleteBilling,
  getEventBillings,
} from "../controllers/billing.controller";

const billingRouter = Router();

const billingInputSchema = z.object({
  product_name: z.string().min(1, "Product name is required"),
  spent_in: z.number().min(1, "Spent amount must be at least 1"),
  sell_for: z.number().min(1, "Sell for amount must be at least 1"),
  initial_stock: z.number().min(1, "Initial stock must be at least 1"),
  remaining_stock: z.number().min(0, "Remaining stock must be >= 0"),
  description: z.string().optional(),
  changed_by: z.string().min(1, "User is required"),
});

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
