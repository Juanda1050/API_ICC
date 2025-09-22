import { supabase } from "../db";

export async function recalculateGraduationTotalCollected(
  graduationId: string
): Promise<void> {
  const { data: allPayments, error: sumError } = await supabase
    .from("graduationPayments")
    .select("amount")
    .eq("graduation_id", graduationId);

  if (sumError)
    throw new Error(
      `Error getting payments for recalculation: ${sumError.message}`
    );

  const totalCollected =
    allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const { error: updateError } = await supabase
    .from("graduations")
    .update({ total_collected: totalCollected })
    .eq("id", graduationId);

  if (updateError)
    throw new Error(`Error updating total_collected: ${updateError.message}`);
}

export async function assignGroupsToGraduation(
  graduationId: string,
  groupIds: number[]
) {
  const rows = groupIds.map((gid) => ({
    graduation_id: graduationId,
    schoolGroup_id: gid,
  }));

  const { error } = await supabase
    .from("graduationGroups")
    .insert(rows)
    .select();

  if (error) throw new Error(`Error assigning groups: ${error.message}`);
}

export async function getGroupsByGraduationService(graduationId: string) {
  const { data, error } = await supabase
    .from("graduationGroups")
    .select("schoolGroups (id, group, grade)")
    .eq("graduation_id", graduationId);

  if (error)
    throw new Error(`Error getting graduation groups: ${error.message}`);
  return data.map((r) => r.schoolGroups);
}

export async function getStudentsByGraduationService(graduationId: string) {
  const { data: groups, error: groupsError } = await supabase
    .from("graduationGroups")
    .select("schoolGroup_id")
    .eq("graduation_id", graduationId);

  if (groupsError)
    throw new Error(`Error getting groups: ${groupsError.message}`);

  const groupIds = groups.map((g) => g.schoolGroup_id);

  if (groupIds.length === 0) return [];

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, name, schoolGroup_id, schoolGroups(group, grade)")
    .in("schoolGroup_id", groupIds);

  if (studentsError)
    throw new Error(`Error getting students: ${studentsError.message}`);
  return students;
}
