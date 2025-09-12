import { Teacher } from "../types/teacher.types";
import { supabase } from "../db";

export async function createTeacherService(
  teacherData: Omit<Teacher, "id" | "created_at" | "updated_at">
): Promise<Teacher> {
  const { data: teacher, error } = await supabase
    .from("teachers")
    .insert(teacherData)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return teacher;
}

export async function getTeachersService(): Promise<Teacher[]> {
  const { data: teachers, error } = await supabase.from("teachers").select("*");

  if (error) throw new Error(error.message);
  return teachers;
}

export async function getTeacherByIdService(
  teacherId: string
): Promise<Teacher | null> {
  const { data: teacher, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", teacherId)
    .single();

  if (error) throw new Error(error.message);
  return teacher;
}

export async function updateTeacherService(
  teacherId: string,
  updateData: Partial<Omit<Teacher, "id" | "created_at" | "updated_at">>
): Promise<Teacher> {
  const { data: teacher, error } = await supabase
    .from("teachers")
    .update(updateData)
    .eq("id", teacherId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return teacher;
}

export async function deleteTeacherService(teacherId: string): Promise<void> {
  const { error } = await supabase
    .from("teachers")
    .delete()
    .eq("id", teacherId);

  if (error) throw new Error(error.message);
}
