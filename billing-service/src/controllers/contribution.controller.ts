import { Request, Response } from "express";
import { error, success } from "../utils/response";
import {
  ContributionFilter,
  ContributionInput,
} from "../types/contribution.types";
import {
  createContributionService,
  deleteContributionService,
  getContributionByIdService,
  getContributionsService,
  updateContributionService,
} from "../services/contribution.service";

export async function createContribution(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);

    const contributionData: ContributionInput = req.body;
    if (!contributionData) return error(res, "No contribution provided", 400);

    const dataToInsert = {
      ...contributionData,
      created_by: createdBy,
      created_at: new Date(),
    };

    const contributionCreatead = await createContributionService(dataToInsert);
    return success(res, contributionCreatead);
  } catch (e: any) {
    return error(res, `createContribution endpoint: ${e.message}`, 500);
  }
}

export async function getContributions(req: Request, res: Response) {
  try {
    const filterBody = req.body?.filter || {};

    const { search, sortBy, sortOrder } = filterBody;

    const filter: ContributionFilter = {
      search: typeof search === "string" ? search : undefined,
      sortBy: typeof sortBy === "string" ? sortBy : "created_at",
      sortOrder:
        sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "asc",
    };

    const contributionList = await getContributionsService(filter);
    return success(res, contributionList);
  } catch (e: any) {
    return error(res, `getContributions endpoint: ${e.message}`, 500);
  }
}

export async function getContributionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const contribution = getContributionByIdService(id);

    if (!contribution) return error(res, "Contribution not found", 404);

    return success(res, contribution);
  } catch (e: any) {
    return error(res, `getContributionById endpoint: ${e.message}`, 500);
  }
}

export async function updateContribution(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 401);

    const { id } = req.params;
    const eventToUpdate: ContributionInput = req.body;

    const dataToUpdate = {
      ...eventToUpdate,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    const eventUpdated = await updateContributionService(id, dataToUpdate);

    return success(res, eventUpdated);
  } catch (e: any) {
    return error(res, `updateContribution endpoint: ${e.message}`, 500);
  }
}

export async function deleteContribution(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await deleteContributionService(id);

    return success(res, true);
  } catch (e: any) {
    return error(res, `deleteContribution endpoint: ${e.message}`, 500);
  }
}
