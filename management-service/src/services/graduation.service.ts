import { supabase } from "../db";
import {
  assignGroupsToGraduation,
  recalculateGraduationTotalCollected,
} from "../helpers/graduation.helper";
import {
  Graduation,
  GraduationExpense,
  GraduationExpenseFilter,
  GraduationPayment,
  GraduationPaymentFilter,
} from "../types/graduation.types";

export async function createGraduationService(
  graduationInput: Graduation
): Promise<Graduation> {
  if (!graduationInput.schoolGroup_ids?.length)
    throw new Error("At least one school group must be specified");

  const { count: totalStudents, error: countError } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .in("schoolGroup_id", graduationInput.schoolGroup_ids);

  if (countError)
    throw new Error(`Error counting students: ${countError.message}`);

  const estimatedCost =
    graduationInput.estimated_cost ||
    graduationInput.cost_per_student * (totalStudents || 0);

  const graduationToInsert = {
    ...graduationInput,
    total_collected: 0,
    estimated_cost: estimatedCost,
  };

  const { data, error } = await supabase
    .from("graduations")
    .insert(graduationToInsert)
    .select()
    .single();

  if (error) throw new Error(`Error creating graduation: ${error.message}`);

  await assignGroupsToGraduation(data.id, graduationInput.schoolGroup_ids);

  return data as Graduation;
}

export async function getGraduationByIdService(
  graduationId: string
): Promise<Graduation> {
  const { data: graduation, error } = await supabase
    .from("graduations")
    .select("*")
    .eq("id", graduationId)
    .single();

  if (error) throw new Error(`Error getting graduation: ${error.message}`);

  return graduation as Graduation;
}

export async function updateGraduationService(
  graduationId: string,
  updates: Partial<Graduation>
): Promise<Graduation> {
  const { data, error } = await supabase
    .from("graduations")
    .update(updates)
    .eq("id", graduationId)
    .select()
    .single();

  if (error) throw new Error(`Error updating graduation: ${error.message}`);

  return data as Graduation;
}

export async function deleteGraduationService(
  graduationId: string
): Promise<void> {
  const { error: expensesError } = await supabase
    .from("graduationExpenses")
    .delete()
    .eq("graduation_id", graduationId);

  if (expensesError)
    throw new Error(
      `Error deleting graduation expenses: ${expensesError.message}`
    );

  const { error: paymentsError } = await supabase
    .from("graduationPayments")
    .delete()
    .eq("graduation_id", graduationId);

  if (paymentsError)
    throw new Error(
      `Error deleting graduation payments: ${paymentsError.message}`
    );

  const { error: graduationError } = await supabase
    .from("graduations")
    .delete()
    .eq("id", graduationId);

  if (graduationError)
    throw new Error(`Error deleting graduation: ${graduationError.message}`);
}

export async function createGraduationPaymentService(
  paymentsInput: GraduationPayment
): Promise<GraduationPayment> {
  const { data: payment, error } = await supabase
    .from("graduationPayments")
    .insert(paymentsInput)
    .select()
    .single();

  if (error)
    throw new Error(`Error creating graduation payment: ${error.message}`);

  await recalculateGraduationTotalCollected(payment.graduation_id);

  return payment as GraduationPayment;
}

export async function getGraduationPaymentsService(
  graduationId: string,
  filter?: GraduationPaymentFilter
): Promise<GraduationPayment[]> {
  let query = supabase
    .from("graduationPayments")
    .select(
      `*, students!inner(
    id, name, schoolGroup_id, schoolGroups(id, group, grade))`
    )
    .eq("graduation_id", graduationId);

  if (filter?.search)
    query = query.ilike("students.name", `%${filter.search}%`);

  if (filter?.schoolGroup_id && filter.schoolGroup_id.length > 0)
    query = query.in("students.schoolGroup_id", filter.schoolGroup_id);

  if (filter?.payment_date && filter.payment_date.length === 2) {
    const [start, end] = filter.payment_date;
    query = query.gte("payment_date", start.toISOString());
    query = query.lte("payment_date", end.toISOString());
  }

  const sortBy = filter?.sortBy || "payment_date";
  const ascending = filter?.sortOrder === "asc";
  query = query.order(sortBy, { ascending });

  const { data, error } = await query;
  if (error)
    throw new Error(`Error getting graduation payments: ${error.message}`);

  return (data as GraduationPayment[]) || [];
}

export async function updateGraduationPaymentService(
  paymentId: string,
  updates: Partial<GraduationPayment>
): Promise<GraduationPayment> {
  const { data: updatedPayment, error: updateError } = await supabase
    .from("graduationPayments")
    .update(updates)
    .eq("id", paymentId)
    .select()
    .single();

  if (updateError)
    throw new Error(
      `Error updating graduation payment: ${updateError.message}`
    );

  await recalculateGraduationTotalCollected(updatedPayment.graduation_id);

  return updatedPayment as GraduationPayment;
}

export async function deleteGraduationPaymentService(
  paymentId: string
): Promise<void> {
  const { data: payment, error: deleteError } = await supabase
    .from("student_graduation_payments")
    .delete()
    .eq("id", paymentId)
    .select("graduation_id")
    .single();

  if (deleteError)
    throw new Error(
      `Error deleting graduation payment: ${deleteError.message}`
    );

  await recalculateGraduationTotalCollected(payment.graduation_id);
}

export async function createGraduationExpenseService(
  expenseInput: GraduationExpense
) {
  const { data, error } = await supabase
    .from("graduation_expenses")
    .insert(expenseInput)
    .select()
    .single();

  if (error) throw new Error(`Error creating expense: ${error.message}`);
  return data;
}

export async function getGraduationExpensesService(
  graduationId: string,
  filter?: GraduationExpenseFilter
): Promise<GraduationExpense[]> {
  let query = supabase
    .from("graduationExpenses")
    .select("*")
    .eq("graduation_id", graduationId);

  if (filter?.search)
    query = query.or(
      `concept.ilike.%${filter.search}%,paid_to.ilike.%${filter.search}%`
    );

  if (filter?.method) query = query.eq("method", filter.method);

  if (filter?.expense_date && filter.expense_date.length === 2) {
    const [start, end] = filter.expense_date;
    query = query.gte("expense_date", start.toISOString());
    query = query.lte("expense_date", end.toISOString());
  }

  const sortBy = filter?.sortBy || "expense_date";
  const ascending = filter?.sortOrder === "asc";
  query = query.order(sortBy, { ascending });

  const { data, error } = await query;
  if (error) throw new Error(`Error getting expenses: ${error.message}`);

  return (data as GraduationExpense[]) || [];
}

export async function updateGraduationExpenseService(
  expenseId: string,
  updates: Partial<GraduationExpense>
): Promise<GraduationExpense> {
  const { data, error } = await supabase
    .from("graduationExpenses")
    .update(updates)
    .eq("id", expenseId)
    .select()
    .single();

  if (error) throw new Error(`Error updating expense: ${error.message}`);
  return data as GraduationExpense;
}

export async function deleteGraduationExpenseService(
  expenseId: string
): Promise<void> {
  const { error } = await supabase
    .from("graduationExpenses")
    .delete()
    .eq("id", expenseId);

  if (error) throw new Error(`Error deleting expense: ${error.message}`);
}

export async function getGraduationFinancialSummaryService(
  graduationId: string
) {
  const { data: graduation, error: gradError } = await supabase
    .from("graduations")
    .select("*")
    .eq("id", graduationId)
    .single();

  if (gradError)
    throw new Error(`Error getting graduation: ${gradError.message}`);

  const { data: graduationGroups, error: groupsError } = await supabase
    .from("graduationGroups")
    .select("schoolGroup_id")
    .eq("graduation_id", graduationId);

  if (groupsError)
    throw new Error(`Error getting graduation groups: ${groupsError.message}`);

  const groupIds = graduationGroups?.map((g) => g.schoolGroup_id) || [];

  let totalStudents = 0;
  if (groupIds.length > 0) {
    const { count, error: countError } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .in("schoolGroup_id", groupIds);

    if (countError)
      throw new Error(`Error counting students: ${countError.message}`);
    totalStudents = count || 0;
  }

  const { data: expenses, error: expError } = await supabase
    .from("graduationExpenses")
    .select("amount")
    .eq("graduation_id", graduationId);

  if (expError) throw new Error(`Error getting expenses: ${expError.message}`);

  const totalSpent =
    expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  const expectedRevenue = (graduation.cost_per_student || 0) * totalStudents;
  const availableBalance = graduation.total_collected - totalSpent;
  const collectionPercentage =
    expectedRevenue > 0
      ? (graduation.total_collected / expectedRevenue) * 100
      : 0;

  return {
    graduation: {
      id: graduation.id,
      name: graduation.name,
      event_date: graduation.event_date,
    },
    finances: {
      cost_per_student: graduation.cost_per_student,
      estimated_cost: graduation.estimated_cost,
      expected_revenue: expectedRevenue,
      total_collected: graduation.total_collected,
      total_spent: totalSpent,
      available_balance: availableBalance,
      collection_percentage: Number(collectionPercentage.toFixed(2)),
    },
    students: {
      total_students: totalStudents,
    },
  };
}

export async function getStudentsPaymentStatusService(graduationId: string) {
  const { data: graduationGroups, error: groupsError } = await supabase
    .from("graduationGroups")
    .select("schoolGroup_id")
    .eq("graduation_id", graduationId);

  if (groupsError)
    throw new Error(`Error getting graduation groups: ${groupsError.message}`);

  const groupIds = graduationGroups?.map((g) => g.schoolGroup_id) || [];
  if (groupIds.length === 0) return [];

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("*, schoolGroups(group, grade)")
    .in("schoolGroup_id", groupIds);

  if (studentsError)
    throw new Error(`Error getting students: ${studentsError.message}`);

  const { data: graduation, error: gradError } = await supabase
    .from("graduations")
    .select("cost_per_student")
    .eq("id", graduationId)
    .single();

  if (gradError)
    throw new Error(`Error getting graduation: ${gradError.message}`);

  const { data: allPayments, error: paymentsError } = await supabase
    .from("graduationPayments")
    .select("*")
    .eq("graduation_id", graduationId)
    .order("payment_date", { ascending: true });

  if (paymentsError)
    throw new Error(`Error getting payments: ${paymentsError.message}`);

  const paymentsByStudent: Record<string, GraduationPayment[]> = {};

  for (const pay of allPayments || []) {
    if (!paymentsByStudent[pay.student_id]) {
      paymentsByStudent[pay.student_id] = [];
    }
    paymentsByStudent[pay.student_id].push(pay as GraduationPayment);
  }

  const results = students.map((student) => {
    const studentPayments = paymentsByStudent[student.id] || [];
    const totalPaid = studentPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const balance = (graduation.cost_per_student || 0) - totalPaid;

    return {
      student_id: student.id,
      student_name: student.name,
      school_group: student.schoolGroups
        ? `${student.schoolGroups.grade}${student.schoolGroups.group}`
        : null,
      total_paid: totalPaid,
      balance_remaining: balance,
      liquidated: totalPaid >= (graduation.cost_per_student || 0),
      payments: studentPayments,
    };
  });

  return results;
}

export async function getGraduationExpenseSummaryService(graduationId: string) {
  const { data: expenses, error } = await supabase
    .from("graduationExpenses")
    .select("*")
    .eq("graduation_id", graduationId)
    .order("expense_date", { ascending: false });

  if (error)
    throw new Error(`Error getting graduation expenses: ${error.message}`);

  const totalSpent =
    expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  const byConcept: Record<string, number> = {};
  expenses?.forEach((e) => {
    byConcept[e.concept] = (byConcept[e.concept] || 0) + e.amount;
  });

  const byMethod: Record<string, number> = {};
  expenses?.forEach((e) => {
    byMethod[e.method] = (byMethod[e.method] || 0) + e.amount;
  });

  return {
    total_spent: totalSpent,
    by_concept: byConcept,
    by_method: byMethod,
    details: expenses || [],
  };
}
