import z from "zod/v3";

export const studentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  paternal_surname: z.string().min(1, "Paternal surname is required"),
  maternal_surname: z.string().min(1, "Maternal surname is required"),
  list_number: z.number().min(1, "List number must be at least 1"),
  schoolGroup_id: z.number().min(1, "School group is required"),
});

export const studentFiltersSchema = z.object({
  schoolGroup_id: z.number().min(1, "School group is required"),
  sortBy: z.enum(["list_number"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const generateTicketsSchema = z.object({
  schoolGroupId: z.string().min(1, "School group is required"),
});
