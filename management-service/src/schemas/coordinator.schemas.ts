import z from "zod/v3";

export const coordinatorInputSchema = z.object({
  email: z.string().optional(),
  telephone: z.string().optional(),
  role_id: z.string().min(1, "Role is required"),
});