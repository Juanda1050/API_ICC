import z from "zod/v3";

export const graduationSchema = z.object({
  name: z.string().min(1, "Graduation name is required"),
  event_date: z.string().datetime("Invalid date format"),
  cost_per_student: z.number().min(1, "Cost per student must be at least 1"),
  estimated_cost: z.number().optional(),
  total_collected: z.number().optional(),
  created_by: z.string().min(1, "User is required"),
});

export const graduationPaymentSchema = z.object({
  graduation_id: z.string().uuid("Invalid graduation ID"),
  student_id: z.string().uuid("Invalid student ID"),
  amount: z.number().min(1, "Payment amount must be at least 1"),
  payment_date: z.string().datetime("Invalid payment date format"),
  created_by: z.string().uuid("Invalid user ID"),
});

export const graduationExpenseSchema = z.object({
  graduation_id: z.string().uuid("Invalid graduation ID"),
  concept: z.string().min(1, "Concept is required"),
  amount: z.number().min(1, "Expense amount must be at least 1"),
  expense_date: z.string().datetime("Invalid expense date format"),
  paid_to: z.string().min(1, "Paid to is required"),
  method: z.string().min(1, "Payment method is required"),
  created_by: z.string().uuid("Invalid user ID"),
});

export const graduationPaymentFilterSchema = z.object({
  search: z.string().optional(),
  schoolGroup_id: z
    .number()
    .int()
    .positive("Invalid school group ID")
    .optional(),
  payment_date: z
    .array(z.string().datetime("Invalid date format"))
    .length(2, "Payment date must be an array of 2 dates [start, end]")
    .optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const graduationExpenseFilterSchema = z.object({
  search: z.string().optional(),
  method: z.string().optional(),
  expense_date: z
    .array(z.string().datetime("Invalid date format"))
    .length(2, "Expense date must be an array of 2 dates [start, end]")
    .optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});