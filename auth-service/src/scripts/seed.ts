import bycrypt from "bcrypt";
import { supabase } from "../db";

export async function seedRoles() {
  const roles = [
    { role_name: "user", description: "Usuario" },
    { role_name: "admin", description: "Administrador" },
    { role_name: "coordinator", description: "Coordinadora" },
    { role_name: "coordinator_general", description: "Coordinadora General" },
  ];

  for (const role of roles) {
    const { error } = await supabase
      .from("roles")
      .upsert(role, { onConflict: "role_name" });

    if (error) {
      console.error(`Error creating role ${role.role_name}:`, error);
    } else {
      console.log(`Role ${role.role_name} created or already exists.`);
    }
  }
}

if (require.main === module) {
  seedRoles().then(() => process.exit(0));
}
