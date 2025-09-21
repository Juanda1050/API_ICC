import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { validateBody, validateParams } from "../middleware/validate";
import {
  createStudentsFromBody,
  createStudentsFromFile,
  deleteStudent,
  generateStudentTicketById,
  generateStudentTickets,
  getStudentById,
  getStudents,
  updateStudent,
} from "../controllers/student.controller";
import { roles } from "../utils/dictionary";
import { upload } from "../middleware/upload";
import {
  generateTicketsSchema,
  studentFiltersSchema,
  studentInputSchema,
} from "../schemas/student.schemas";

const studentRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([
    roles.admin.id,
    roles.coordinator_general.id,
    roles.coordinator.id,
  ]),
];

studentRouter.get("/:id", ...adminAuth, getStudentById);
studentRouter.post(
  "/getAll",
  ...adminAuth,
  validateBody(studentFiltersSchema),
  getStudents
);
studentRouter.post(
  "/",
  ...adminAuth,
  validateBody(studentInputSchema),
  createStudentsFromBody
);
studentRouter.post(
  "/upload",
  ...adminAuth,
  upload.single("file"),
  createStudentsFromFile
);
studentRouter.post(
  "/tickets/:schoolGroupId",
  ...adminAuth,
  validateParams(generateTicketsSchema),
  generateStudentTickets
);
studentRouter.post(
  "/ticket/:studentId",
  ...adminAuth,
  generateStudentTicketById
);
studentRouter.put(
  "/:id",
  ...adminAuth,
  validateBody(studentInputSchema.partial()),
  updateStudent
);
studentRouter.delete("/:id", ...adminAuth, deleteStudent);

export default studentRouter;
