import { Request, Response } from "express";
import { error, success } from "../utils/response";
import {
  Graduation,
  GraduationPayment,
  GraduationPaymentFilter,
} from "../types/graduation.types";
import {
  createGraduationPaymentService,
  createGraduationService,
  deleteGraduationPaymentService,
  deleteGraduationService,
  getGraduationByIdService,
  getGraduationPaymentsService,
  updateGraduationPaymentService,
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

export async function createGraduationPayment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);

    const paymentData: GraduationPayment = req.body;
    if (!paymentData) return error(res, "No graduation payment provied", 400);

    const dataToInsert = {
      ...paymentData,
      created_by: createdBy,
      created_at: new Date(),
    };

    const paymentCreated = await createGraduationPaymentService(dataToInsert);
    return success(res, paymentCreated);
  } catch (e: any) {
    return error(res, `createGraduationPayment endpoint: ${e.message}`, 500);
  }
}

export async function getGraduationPayments(req: Request, res: Response) {
  try {
    const { graduationId } = req.params;
    const filterBody = req.body?.filter || {};

    const { search, schoolGroup_id, payment_date, sortBy, sortOrder } =
      filterBody;

    const filter: GraduationPaymentFilter = {
      search: typeof search === "string" ? search : undefined,
      schoolGroup_id: Array.isArray(schoolGroup_id)
        ? schoolGroup_id.filter((id: any) => typeof id === "number")
        : typeof schoolGroup_id === "number"
        ? [schoolGroup_id]
        : undefined,
      payment_date:
        Array.isArray(payment_date) && payment_date.length === 2
          ? [new Date(payment_date[0]), new Date(payment_date[1])]
          : undefined,
      sortBy: typeof sortBy === "string" ? sortBy : "payment_date",
      sortOrder:
        sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc",
    };

    const payments = await getGraduationPaymentsService(graduationId, filter);
    return success(res, payments);
  } catch (e: any) {
    return error(res, `getGraduationPayments endpoint: ${e.message}`, 500);
  }
}

export async function updateGraduationPayments(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const paymentToUpdate = req.body;

    const paymentUpdated: GraduationPayment =
      await updateGraduationPaymentService(id, paymentToUpdate);

    return success(res, paymentUpdated);
  } catch (e: any) {
    return error(res, `updateGraduationPayments endpoint: ${e.message}`, 500);
  }
}

export async function deleteGraduationPayment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await deleteGraduationPaymentService(id);

    return success(res, true);
  } catch (e: any) {
    return error(res, `updateGraduationPayments endpoint: ${e.message}`, 500);
  }
}
