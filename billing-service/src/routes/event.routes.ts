import { validateBody } from "./../../../management-service/src/middleware/validate";
import { Router } from "express";
import z from "zod/v3";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { roles } from "../utils/dictionary";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "../controllers/event.controller";

const eventRouter = Router();

const eventInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  place: z.string().min(1, "Place is required"),
  event_date: z.preprocess(
    (arg) =>
      typeof arg === "string" || arg instanceof Date
        ? new Date(arg)
        : undefined,
    z.date()
  ),
  changed_by: z.string().min(1, "User is required"),
});

const eventFilterSchema = z.object({
  search: z.string().optional(),
  place: z.string().optional(),
  start_event_date: z.preprocess(
    (arg) =>
      typeof arg === "string" || arg instanceof Date
        ? new Date(arg)
        : undefined,
    z.date().optional()
  ),
  end_event_date: z.preprocess(
    (arg) =>
      typeof arg === "string" || arg instanceof Date
        ? new Date(arg)
        : undefined,
    z.date().optional()
  ),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

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
