import { Request, Response } from "express";
import { error, success } from "../utils/response";
import { cleanUpFile, parseCSV, parseExcel } from "../services/csv.service";
import {
  createStudentsService,
  deleteStudentService,
  getStudentByIdService,
  getStudentsByGroupAndGradeService,
  getStudentsService,
  updateStudentService,
} from "../services/student.service";
import { StudentFilter } from "../types/student.types";
import { generateGroupTickets } from "../services/pdf.service";

export async function createStudents(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unathorized: missing user", 401);

    let studentsData: any[] = [];

    if (req.file) {
      const filePath = req.file.path;
      if (filePath.endsWith(".csv")) studentsData = await parseCSV(filePath);
      else if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls"))
        studentsData = await parseExcel(filePath);
      else cleanUpFile(filePath);
    } else if (req.body.students) studentsData = req.body.students;
    else return error(res, "No students data provided", 400);

    if (studentsData.length === 0)
      return error(res, "No students data provided", 400);

    const dataToInsert = studentsData.map((s) => ({
      ...s,
      created_by: createdBy,
      created_at: new Date(),
    }));

    const studentsInserted = await createStudentsService(dataToInsert);
    if (req.file) await cleanUpFile(req.file.path);

    return success(res, studentsInserted);
  } catch (e: any) {
    if (req.file) await cleanUpFile(req.file.path);
    return error(res, e.message, 500);
  }
}

export async function getStudents(req: Request, res: Response) {
  try {
    const filters: StudentFilter = {
      group: req.query.group as string,
      grade: req.query.grade as string,
      sortBy: req.query.sortBy as "list_number",
      sortOrder: req.query.sortOrder as "asc" | "desc",
    };

    const studentList = await getStudentsService(filters);
    return success(res, studentList);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function getStudentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const student = await getStudentByIdService(id);

    if (!student) return error(res, "Student not found", 404);

    return success(res, student);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function updateStudent(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unathorized: missing user", 401);

    const { id } = req.params;
    const studentToUpdate = req.body;

    const dataToInsert = {
      ...studentToUpdate,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    const student = await updateStudentService(id, dataToInsert);

    return success(res, student);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function deleteStudent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await deleteStudentService(id);

    return success(res, true);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function generateStudentTickets(req: Request, res: Response) {
  try {
    const { group, grade } = req.params;

    if (!group || !grade)
      return error(res, "Group and Grade are required", 400);

    const students = await getStudentsByGroupAndGradeService(group, grade);

    if (students.length === 0)
      return error(
        res,
        "No students found for the specified group and grade",
        404
      );

    const pdfBuffer = await generateGroupTickets(students, group, grade);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachement;filename="Recibos_${group}${grade}.pdf`
    );

    return res.send(pdfBuffer);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}
