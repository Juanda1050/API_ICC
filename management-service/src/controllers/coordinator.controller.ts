import { Request, Response } from "express";
import { error, success } from "../utils/response";
import {
  getCoordinatorsService,
  updateCoordinatorService,
} from "../services/coordinator.service";

export async function getCoordinators(req: Request, res: Response) {
  try {
    const coordinatorList = await getCoordinatorsService();
    return success(res, coordinatorList);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}

export async function updateCoordinator(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const coordinatorData = req.body;

    const coordinator = await updateCoordinatorService(id, coordinatorData);
    return success(res, coordinator);
  } catch (e: any) {
    return error(res, e.message, 500);
  }
}
