import { Router } from "express";
import z from "zod/v3";
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

const teacherRouter = Router();

const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  last_name: z.string().min(1, "Last name is required"),
  type_id: z.string().min(1, "Teacher type is required"),
});

const updateTeacherSchema = z.object({
  name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  type_id: z.string().min(1).optional(),
});

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([roles.admin.id, roles.coordinator_general.id]),
];

teacherRouter.get("/", ...adminAuth, getTeachers);
teacherRouter.get("/:id", ...adminAuth, getTeacherById);
teacherRouter.post(
  "/",
  ...adminAuth,
  validateBody(createTeacherSchema),
  createTeacher
);
teacherRouter.put(
  "/:id",
  ...adminAuth,
  validateBody(updateTeacherSchema),
  updateTeacher
);
teacherRouter.delete("/:id", ...adminAuth, deleteTeacher);

export default teacherRouter;
