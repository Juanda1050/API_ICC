import { supabase } from "../../auth-service/src/db";
import { Coordinator } from "../types/coordinator.types";

export async function getCoordinators(): Promise<Coordinator[]> {
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
