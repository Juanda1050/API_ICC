import { Request, Response } from "express";
import { error, success } from "../utils/response";
import {
  createBillingService,
  deleteBillingService,
  getEventBillingsService,
  updateBillingService,
} from "../services/billing.service";

export async function createBilling(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);

    const billingData = req.body;
    if (!billingData) return error(res, "No billing data provided", 400);

    const dataToInsert = {
      ...billingData,
      created_by: createdBy,
      created_at: new Date(),
    };

    const billingCreated = await createBillingService(dataToInsert);

    return success(res, billingCreated);
  } catch (e: any) {
    return error(res, `createBilling endpoint: `, 500);
  }
}

export async function getEventBillings(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    if (!eventId) return error(res, "Event Id not found", 400);

    const billingList = await getEventBillingsService(eventId);
    return success(res, billingList);
  } catch (e: any) {
    return error(res, `getEventBillings endpoint: `, 500);
  }
}

export async function updateBilling(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 401);

    const { id } = req.params;
    const billingToUpdate = req.body;

    const dataToUpdate = {
      ...billingToUpdate,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    const billingUpdated = await updateBillingService(id, dataToUpdate);

    return success(res, billingUpdated);
  } catch (e: any) {
    return error(res, `updateBilling endpoint: `, 500);
  }
}

export async function deleteBilling(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 401);

    const { id } = req.params;
    await deleteBillingService(id, updatedBy);

    return success(res, true);
  } catch (e: any) {
    return error(res, `deleteBilling endpoint: `, 500);
  }
}
