import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import {
  createTeacher,
  deleteTeacher,
  getTeacherById,
  getTeachers,
  updateTeacher,
} from "../controllers/teacher.controller";
import { validateBody } from "../middleware/validate";
import { roles } from "../utils/dictionary";
import { teacherInputSchema } from "../schemas/teacher.schemas";

const teacherRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([roles.admin.id, roles.coordinator_general.id]),
];

teacherRouter.get("/", ...adminAuth, getTeachers);
teacherRouter.get("/:id", ...adminAuth, getTeacherById);
teacherRouter.post(
  "/",
  ...adminAuth,
  validateBody(teacherInputSchema),
  createTeacher
);
teacherRouter.put(
  "/:id",
  ...adminAuth,
  validateBody(teacherInputSchema.partial()),
  updateTeacher
);
teacherRouter.delete("/:id", ...adminAuth, deleteTeacher);

export default teacherRouter;
