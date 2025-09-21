import { z } from "zod/v3";

export const teacherInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  last_name: z.string().min(1, "Last name is required"),
  type_id: z.string().min(1, "Teacher type is required"),
});