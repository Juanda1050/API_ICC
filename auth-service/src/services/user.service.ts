import bcrypt from "bcrypt";
import { supabase } from "../db";

export async function getUserProfile(userId: string) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select(`id, email, telephone, role_id, active, created_at, updated_at`)
    .eq("id", userId)
    .is("deleted_at", null)
    .single();

  if (userError || !user) throw new Error("User not found");

  return user;
}

export async function activateUser(userId: string) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .update({ active: true, updated_at: new Date() })
    .eq("id", userId)
    .is("deleted_at", null)
    .select(`id, email, telephone, role_id, active, created_at, updated_at`)
    .single();

  if (userError || !user) throw new Error("User not found");

  return user;
}

export async function updateUser(
  userId: string,
  email: string,
  telephone: string,
  password: string
) {
  const updateData: any = {};
  if (email) updateData.email = email;
  if (telephone) updateData.telephone = telephone;
  if (password) updateData.password_hash = await bcrypt.hash(password, 10);

  if (Object.keys(updateData).length === 0)
    throw new Error("No data provided for update");

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .is("deleted_at", null)
    .select(`id, email, telephone, role_id, active, created_at, updated_at`)
    .single();

  if (updateError || !updatedUser) throw new Error("Failed to update user");

  return updatedUser;
}

export async function deleteUser(userId: string) {
  const { error } = await supabase
    .from("users")
    .update({ active: false, deleted_at: new Date() })
    .eq("id", userId)
    .is("deleted_at", null);

  if (error) throw new Error("Failed to delete user");

  return { message: "User deleted successfully" };
}
