import z from "zod/v3";

export const updatedUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  telephone: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

export const toggleUserSchema = z.object({
  active: z.boolean(),
});
