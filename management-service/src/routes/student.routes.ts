import { Router } from "express";
import multer from "multer";
import path from "path";
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

const studentRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only CSV and Excel files are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

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
  authorizeMiddleware(["admin", "coordinator_general", "coordinator"]),
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
