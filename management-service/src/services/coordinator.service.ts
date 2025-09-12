import { supabase } from "../db";
import { Coordinator } from "../types/coordinator.types";

export async function getCoordinatorsService(): Promise<Coordinator[]> {
  const { data: coordinators, error } = await supabase
    .from("users")
    .select("id, name, roles(id, name)")
    .eq("roles.name", "coordinator");

  if (error) throw new Error(error.message);

  return (coordinators as any[]).map((c) => ({
    id: c.id,
    name: c.name,
    roleName: c.roles?.name || "",
    roles: c.roles
      ? {
          id: c.roles.id || "",
          name: c.roles.name || "",
        }
      : undefined,
  }));
}

export async function updateCoordinatorService(
  id: string,
  updates: Partial<Pick<Coordinator, "email" | "telephone" | "role_id">>
): Promise<Coordinator> {
  if (Object.keys(updates).length === 0) {
    throw new Error("No updates provided");
  }

  const { data: coordinator, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!coordinator) throw new Error("Coordinator not found");
  return coordinator;
}
