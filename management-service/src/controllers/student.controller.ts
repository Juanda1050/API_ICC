import { Request, Response } from "express";
import { error, success } from "../utils/response";
import { cleanUpFile, parseCSV, parseExcel } from "../services/csv.service";
import {
  deleteStudentService,
  getStudentByIdService,
  getStudentsBySchoolGroupService,
  getSchoolGroupData,
  updateStudentService,
  getSchoolGroupByIdService,
  getSchoolGroupsByGradeService,
} from "../services/student.service";
import { generateGroupTickets } from "../services/pdf.service";
import { SchoolGroupFilter } from "../types/school.types";
import {
  insertStudents,
  mapCSVStudentsToStudents,
} from "../helpers/student.helper";
import { CSVStudent } from "../types/student.types";

export async function createStudentsFromBody(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);

    const studentsData = req.body.students;
    if (!studentsData) return error(res, "No students data provided", 400);

    const studentsInserted = await insertStudents(studentsData, createdBy);

    return success(res, studentsInserted);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function createStudentsFromFile(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);
    if (!req.file) return error(res, "No file uploaded", 400);

    const filePath = req.file.path;
    let csvStudents: CSVStudent[] = [];

    if (filePath.endsWith(".csv")) {
      csvStudents = await parseCSV(filePath);
    } else if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls")) {
      csvStudents = await parseExcel(filePath);
    } else {
      await cleanUpFile(filePath);
      return error(res, "Unsupported file format", 400);
    }

    const studentsData = await mapCSVStudentsToStudents(csvStudents);

    if (studentsData.length === 0) {
      await cleanUpFile(filePath);
      return error(
        res,
        "No valid students found or school groups not found",
        400
      );
    }

    const studentsInserted = await insertStudents(studentsData, createdBy);

    await cleanUpFile(filePath);
    return success(res, studentsInserted);
  } catch (e: any) {
    if (req.file) await cleanUpFile(req.file.path);
    return error(res, e.message, 500);
  }
}

export async function getStudents(req: Request, res: Response) {
  try {
    const { schoolGroup_id, sortBy, sortOrder } = req.body;

    let groupId: number | undefined;

    if (typeof schoolGroup_id === "string" && schoolGroup_id.trim() !== "") {
      const parsed = parseInt(schoolGroup_id, 10);
      if (!isNaN(parsed)) groupId = parsed;
    } else if (typeof schoolGroup_id === "number") {
      groupId = schoolGroup_id;
    }

    const filter: SchoolGroupFilter = {
      schoolGroup_id: groupId,
      sortBy: typeof sortBy === "string" ? sortBy : "list_number",
      sortOrder:
        sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "asc",
    };

    const studentList = await getSchoolGroupData(filter);
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

export async function getSchoolGroupByGrade(req: Request, res: Response) {
  try {
    const { grade, level } = req.body;

    if (!grade || !level) return error(res, "No grade or level provided", 400);

    const schoolGroups = await getSchoolGroupsByGradeService(grade, level);

    return success(res, schoolGroups);
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

export async function generateStudentTicketById(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    if (!studentId) return error(res, "Student ID is required", 400);

    const student = await getStudentByIdService(studentId);
    if (!student) return error(res, "Student not found", 404);

    const schoolGroup = await getSchoolGroupByIdService(student.schoolGroup_id);
    if (!schoolGroup) return error(res, "School group not found", 404);

    const pdfBuffer = await generateGroupTickets(
      [student],
      schoolGroup.group,
      schoolGroup.grade
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Recibo_${student.name}_${schoolGroup.group}${schoolGroup.grade}.pdf"`
    );

    return res.send(pdfBuffer);
  } catch (e: any) {
    return error(res, `generateStudentTicketById: ${e.message}`, 500);
  }
}

export async function generateStudentTickets(req: Request, res: Response) {
  try {
    const { schoolGroupId } = req.params;
    const schoolGroup_id = Number(schoolGroupId);

    if (!schoolGroup_id) return error(res, "Group and Grade are required", 400);

    const { students, schoolGroup } = await getStudentsBySchoolGroupService(
      schoolGroup_id
    );

    if (students.length === 0)
      return error(
        res,
        "No students found for the specified group and grade",
        404
      );

    const pdfBuffer = await generateGroupTickets(
      students,
      schoolGroup.group,
      schoolGroup.grade
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachement;filename="Recibos_${schoolGroup.group}${schoolGroup.grade}.pdf`
    );

    return res.send(pdfBuffer);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}
