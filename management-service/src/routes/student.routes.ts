import { Router } from "express";
import z from "zod/v3";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createStudentsFromBody,
  createStudentsFromFile,
  deleteStudent,
  generateStudentTickets,
  getStudentById,
  getStudents,
  updateStudent,
} from "../controllers/student.controller";
import { roles } from "../utils/dictionary";
import { upload } from "../middleware/upload";

const studentRouter = Router();

const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  paternal_surname: z.string().min(1, "Paternal surname is required"),
  maternal_surname: z.string().min(1, "Maternal surname is required"),
  list_number: z
    .number()
    .int()
    .positive("List number must be a positive integer"),
  schoolGroup_id: z.number().min(1, "School group is required"),
});

const updateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  paternal_surname: z.string().optional(),
  maternal_surname: z.string().optional(),
  list_number: z.number().int().positive().optional(),
  schoolGroup_id: z.number().min(1, "School group is required"),
});

const studentFiltersSchema = z.object({
  schoolGroup_id: z.number().min(1, "School group is required"),
  sortBy: z.enum(["list_number"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const generateTicketsSchema = z.object({
  schoolGroup_id: z.number().min(1, "School group is required"),
});

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([
    roles.admin.id,
    roles.coordinator_general.id,
    roles.coordinator.id,
  ]),
];

studentRouter.get(
  "/",
  ...adminAuth,
  validateQuery(studentFiltersSchema),
  getStudents
);
studentRouter.get("/:id", ...adminAuth, getStudentById);
studentRouter.post(
  "/",
  ...adminAuth,
  validateBody(createStudentSchema),
  createStudentsFromBody
);
studentRouter.post(
  "/upload",
  ...adminAuth,
  upload.single("file"),
  createStudentsFromFile
);
studentRouter.post(
  "/tickets",
  ...adminAuth,
  validateBody(generateTicketsSchema),
  generateStudentTickets
);
studentRouter.put(
  "/:id",
  ...adminAuth,
  validateBody(updateStudentSchema),
  updateStudent
);
studentRouter.delete("/:id", ...adminAuth, deleteStudent);

export default studentRouter;
