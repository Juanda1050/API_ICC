import { supabase } from "../db";
import { Graduation } from "../types/graduation.types";

export async function createGraduationService(
  graduationInput: Graduation
): Promise<Graduation> {
  const { data, error } = await supabase
    .from("graduations")
    .insert(graduationInput)
    .select()
    .single();

  if (error) throw new Error(`Error creating graduation: ${error.message}`);

  return data as Graduation;
}
