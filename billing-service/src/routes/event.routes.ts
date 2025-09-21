import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { roles } from "../utils/dictionary";
import { eventFilterSchema, eventInputSchema } from "../schemas/event.schemas";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "../controllers/event.controller";
import { validateBody } from "../middleware/validate";

const eventRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([
    roles.admin.id,
    roles.coordinator_general.id,
    roles.coordinator.id,
  ]),
];

eventRouter.get("/:id", ...adminAuth, getEventById);
eventRouter.post(
  "/getAll",
  ...adminAuth,
  validateBody(eventFilterSchema),
  getEvents
);
eventRouter.post(
  "/",
  ...adminAuth,
  validateBody(eventInputSchema),
  createEvent
);
eventRouter.put(
  "/:id",
  ...adminAuth,
  validateBody(eventInputSchema.partial()),
  updateEvent
);
eventRouter.delete("/:id", ...adminAuth, deleteEvent);

export default eventRouter;
