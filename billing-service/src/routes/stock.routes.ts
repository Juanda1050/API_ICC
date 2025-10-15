import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { roles } from "../utils/dictionary";
import {
  createStock,
  deleteStock,
  getEventStock,
  updateStock,
} from "../controllers/stock.controller";
import { stockInputSchema } from "../schemas/stock.schemas";
import { validateBody } from "../middleware/validate";

const stockRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([
    roles.admin.id,
    roles.coordinator_general.id,
    roles.coordinator.id,
  ]),
];

stockRouter.post(
  "/",
  ...adminAuth,
  validateBody(stockInputSchema),
  createStock
);
stockRouter.get("/:eventId", ...adminAuth, getEventStock);
stockRouter.put(
  "/:id",
  ...adminAuth,
  validateBody(stockInputSchema.partial()),
  updateStock
);
stockRouter.delete("/:id", ...adminAuth, deleteStock);

export default stockRouter;
