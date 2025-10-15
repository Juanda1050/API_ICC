import { Request, Response } from "express";
import { error, success } from "../utils/response";
import {
  createStockService,
  deleteStockService,
  getEventStockService,
  updateStockService,
} from "../services/stock.service";

export async function createStock(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);

    const stockData = req.body;
    if (!stockData) return error(res, "No stock data provided", 400);

    const dataToInsert = {
      ...stockData,
      created_by: createdBy,
      created_at: new Date(),
    };

    const stockCreated = await createStockService(dataToInsert);

    return success(res, stockCreated);
  } catch (e: any) {
    return error(res, `createStock endpoint: ${e}`, 500);
  }
}

export async function getEventStock(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    if (!eventId) return error(res, "Event Id not found", 400);

    const stockList = await getEventStockService(eventId);
    return success(res, stockList);
  } catch (e: any) {
    return error(res, `getEventStock endpoint: ${e}`, 500);
  }
}

export async function updateStock(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 401);

    const { id } = req.params;
    const stockToUpdate = req.body;

    const dataToUpdate = {
      ...stockToUpdate,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    const stockUpdated = await updateStockService(id, dataToUpdate);

    return success(res, stockUpdated);
  } catch (e: any) {
    return error(res, `updateStock endpoint: ${e}`, 500);
  }
}

export async function deleteStock(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 401);

    const { id } = req.params;
    await deleteStockService(id, updatedBy);

    return success(res, true);
  } catch (e: any) {
    return error(res, `deleteStock endpoint: ${e}`, 500);
  }
}
