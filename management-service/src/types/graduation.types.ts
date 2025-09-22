export interface Graduation {
  id?: string;
  name: string;
  event_date: Date;
  cost_per_student: number;
  estimated_cost?: number;
  total_collected?: number;
  schoolGroup_ids?: number[];
  created_by: string;
  created_at?: Date;
}

export interface GraduationPayment {
  id?: string;
  graduation_id: string;
  student_id: string;
  amount: number;
  payment_date: Date;
  created_by: string;
  created_at?: Date;
}

export interface GraduationExpense {
  id?: string;
  graduation_id: string;
  concept: string;
  amount: number;
  expense_date: Date;
  paid_to: string;
  method: string;
  created_by: string;
  created_at?: Date;
}

export interface GraduationPaymentFilter {
  search?: string;
  schoolGroup_id?: number[];
  payment_date?: [Date, Date];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GraduationExpenseFilter {
  search?: string;
  method?: string;
  expense_date?: [Date, Date];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
