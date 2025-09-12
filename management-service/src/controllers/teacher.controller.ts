import { Request, Response } from "express";
import { error, success } from "../utils/response";
import {
  createTeacherService,
  deleteTeacherService,
  getTeacherByIdService,
  getTeachersService,
  updateTeacherService,
} from "../services/teacher.service";

export async function createTeacher(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 500);

    const teacherData = req.body;
    const dataToInsert = {
      ...teacherData,
      created_by: createdBy,
      created_at: new Date(),
    };

    const teacher = await createTeacherService(dataToInsert);

    return success(res, teacher);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function getTeachers(req: Request, res: Response) {
  try {
    const teacherList = await getTeachersService();
    return success(res, teacherList);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function getTeacherById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const teacher = await getTeacherByIdService(id);

    if (!teacher) return error(res, "Teacher not found", 404);

    return success(res, teacher);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function updateTeacher(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 500);

    const { id } = req.params;
    const teacherData = req.body;

    const dataToUpdate = {
      ...teacherData,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    const teacher = await updateTeacherService(id, dataToUpdate);
    return success(res, teacher);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function deleteTeacher(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await deleteTeacherService(id);

    return success(res, true);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}
