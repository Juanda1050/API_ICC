import { Request, Response } from "express";
import { error, success } from "../utils/response";
import { supabase } from "../db";
import {
  activateUser,
  deleteUser,
  getUserProfile,
  updateUser,
} from "../services/user.service";

export async function userProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) return error(res, "Unauthorized", 401);

    const user = await getUserProfile(userId);

    return success(res, user);
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function toggleUser(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    const { isActive } = req.body;
    if (typeof isActive !== "boolean")
      return error(res, "isActive must be a boolean", 400);

    const user = await activateUser(userId);

    return success(res, user);
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function updateUserProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { email, telephone, password } = req.body;

    if (!userId) return error(res, "Unauthorized", 401);

    const userUpdated = await updateUser(userId, email, telephone, password);

    return success(res, userUpdated);
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}

export async function deleteUserAccount(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    const { data: currentUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .single();

    if (!currentUser) return error(res, "User not found", 404);

    const userDeleted = await deleteUser(userId);

    return success(res, userDeleted);
  } catch (e: any) {
    return error(res, e.message, 400);
  }
}
