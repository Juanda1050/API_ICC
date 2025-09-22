import { Request, Response } from "express";
import { error, success } from "../utils/response";
import { Graduation } from "../types/graduation.types";
import {
  createGraduationService,
  deleteGraduationService,
  getGraduationByIdService,
  updateGraduationService,
} from "../services/graduation.service";

export async function createGraduation(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);

    const graduationData: Graduation = req.body;
    if (!graduationData) return error(res, "No graduation provied", 400);

    const dataToInsert = {
      ...graduationData,
      created_by: createdBy,
      created_at: new Date(),
    };

    const graduationCreated = await createGraduationService(dataToInsert);
    return success(res, graduationCreated);
  } catch (e: any) {
    return error(res, `createGraduation endpoint: ${e.message}`, 500);
  }
}

export async function getGraduationById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const graduation = await getGraduationByIdService(id);

    if (!graduation) return error(res, "Graduation not found", 400);

    return success(res, graduation);
  } catch (e: any) {
    return error(res, `getGraduationById endpoint: ${e.message}`, 500);
  }
}

export async function updateGraduation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const graduationToUpdate: Graduation = req.body;

    const graduationUpdated = await updateGraduationService(
      id,
      graduationToUpdate
    );
    return success(res, graduationUpdated);
  } catch (e: any) {
    return error(res, `updateGraduation endpoint: ${e.message}`, 500);
  }
}

export async function deleteGraduation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await deleteGraduationService(id);

    return success(res, true);
  } catch (e: any) {
    return error(res, `deleteGraduation endpoint: ${e.message}`, 500);
  }
}
