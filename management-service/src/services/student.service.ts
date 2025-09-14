import { Student } from "../types/student.types";
import { Teacher } from "../types/teacher.types";
import { Coordinator } from "../types/coordinator.types";
import { supabase } from "../db";
import { SchoolGroupFilter } from "../types/school.types";
import { roles } from "../utils/dictionary";

export async function createStudentsService(
  studentData: Omit<Student, "id" | "created_at" | "updated_at">[]
): Promise<Student[]> {
  const { data: students, error } = await supabase
    .from("students")
    .insert(studentData)
    .select();

  if (error) throw new Error(error.message);
  return students;
}

export async function findSchoolGroupIdService(
  schoolName: string,
  group: string,
  grade: string
): Promise<number | null> {
  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("id")
    .ilike("schoolName", schoolName.trim())
    .maybeSingle();

  if (schoolError) {
    console.error(schoolError);
    return null;
  }

  if (!school) {
    console.warn(`No school found for name=${schoolName}`);
    return null;
  }

  const { data, error } = await supabase
    .from("schoolGroups")
    .select("id")
    .eq("group", group)
    .eq("grade", grade)
    .eq("school_id", school.id)
    .maybeSingle();

  if (error) {
    console.error(`Error finding schoolGroup: ${error.message}`);
    return null;
  }
  return data?.id ?? null;
}

export async function getSchoolGroupData(
  filter: SchoolGroupFilter = {}
): Promise<{
  students: Student[];
  teachers: Teacher[];
  coordinator: Coordinator | null;
}> {
  const { data: students, error: errorStudents } = await supabase
    .from("students")
    .select("*")
    .eq("schoolGroup_id", filter.schoolGroup_id)
    .order(filter.sortBy || "list_number", {
      ascending: filter.sortOrder === "asc",
    });

    console.log(filter)

  if (errorStudents) throw new Error(errorStudents.message);

  const { data: teachersData, error: errorTeachers } = await supabase
    .from("teacherGroups")
    .select(
      `
      teacher:teachers (*)
    `
    )
    .eq("schoolGroup_id", filter.schoolGroup_id);

  if (errorTeachers) throw new Error(errorTeachers.message);

  const teachers: Teacher[] = (teachersData || [])
    .map((tg) => tg.teacher)
    .flat();

  const { data: group, error: errorGroup } = await supabase
    .from("schoolGroups")
    .select("id, school_id, school:schools (id, schoolName)")
    .eq("id", filter.schoolGroup_id)
    .maybeSingle();

  if (errorGroup) throw new Error(errorGroup.message);

  let coordinator: Coordinator | null = null;

  if (group?.school_id) {
    const { data: coordData, error: errorCoord } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        telephone,
        role:roles (
          id,
          role_name
        )
      `
      )
      .eq("school_id", group.school_id)
      .eq("role_id", roles.coordinator.id)
      .maybeSingle();

    if (errorCoord) throw new Error(errorCoord.message);

    if (coordData) {
      coordinator = {
        id: coordData.id,
        name: coordData.name,
        email: coordData.email,
        telephone: coordData.telephone,
        roleName: roles.coordinator.name,
      };
    }
  }

  return {
    students: students || [],
    teachers: teachers || [],
    coordinator,
  };
}

export async function getStudentsBySchoolGroupService(schoolGroup_id: number) {
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .eq("schoolGroup_id", schoolGroup_id)
    .order("list_number", { ascending: true });

  if (error) throw new Error(error.message);

  const { data: schoolGroup, error: schoolGroupError } = await supabase
    .from("schoolGroups")
    .select("*")
    .eq("id", schoolGroup_id)
    .single();

  if (schoolGroupError) throw new Error(schoolGroupError.message);

  return { students, schoolGroup };
}

export async function getStudentByIdService(
  id: string
): Promise<Student | null> {
  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return student;
}

export async function updateStudentService(
  id: string,
  updates: Partial<Omit<Student, "id" | "created_at" | "created_by">>
): Promise<Student> {
  if (Object.keys(updates).length === 0) {
    throw new Error("No updates provided");
  }

  const { data: student, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return student;
}

export async function deleteStudentService(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
