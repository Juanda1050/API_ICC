import { Request, Response } from "express";
import { error, success } from "../utils/response";
import {
  createIndivContributionService,
  deleteIndivContributionService,
  getIndivContributionsService,
  updateIndivContributionService,
} from "../services/individualContribution.service";

export async function createIndivContribution(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);

    const indivContributionData = req.body;
    if (!indivContributionData)
      return error(res, "No Individual Contribution data provided", 400);

    const dataToInsert = {
      ...indivContributionData,
      created_by: createdBy,
      createad_at: new Date(),
    };

    const indivContributionCreated = await createIndivContributionService(
      dataToInsert
    );
    return success(res, indivContributionCreated);
  } catch (e: any) {
    return error(res, `createIndivContribution endpoint: ${e.message}`, 500);
  }
}

export async function getIndivContributions(req: Request, res: Response) {
  try {
    const { contributionId } = req.params;
    if (!contributionId) return error(res, "Contribution Id not found", 400);

    const indivContributionList = await getIndivContributionsService(
      contributionId
    );
    return success(res, indivContributionList);
  } catch (e: any) {
    return error(res, `getIndivContributions endpoint: ${e.message}`, 500);
  }
}

export async function updateIndivContribution(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 401);

    const { id } = req.params;
    const indivContributionToUpdate = req.body;

    const dataToUpdate = {
      ...indivContributionToUpdate,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    const indivContributionUpdated = await updateIndivContributionService(
      id,
      dataToUpdate
    );
    return success(res, indivContributionUpdated);
  } catch (e: any) {
    return error(res, `updateIndivContribution endpoint: ${e.message}`, 500);
  }
}

export async function deleteIndivContribution(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 401);

    const { id } = req.params;
    await deleteIndivContributionService(id, updatedBy);

    return success(res, true);
  } catch (e: any) {
    return error(res, `deleteIndivContribution endpoint: ${e.message}`, 500);
  }
}
