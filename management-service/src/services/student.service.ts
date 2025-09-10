import { Student, StudentFilter } from "../types/student.types";
import { Teacher } from "../types/teacher.types";
import { Coordinator } from "../types/coordinator.types";
import { supabase } from "../db";

export async function createStudents(
  studentData: Omit<Student, "id" | "created_at" | "updated_at">[]
): Promise<Student[]> {
  const { data: students, error } = await supabase
    .from("students")
    .insert(studentData)
    .select();

  if (error) throw new Error(error.message);
  return students;
}

export async function getStudents(filters: StudentFilter = {}): Promise<{
  students: Student[];
  teachers: Teacher[];
  coordinator: Coordinator;
}> {
  let query = supabase.from("students")
    .select(`*, teachers(*), coordinator:users(
        id,
        name,
        role:roles(name)
      )`);

  if (filters.group) query = query.eq("group", filters.group);
  if (filters.grade) query = query.eq("grade", filters.grade);

  const sortBy = filters.sortBy || "list_number";
  const sortOrder = filters.sortOrder || "asc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const teachersSet = new Map<string, Teacher>();
  let coordinator: Coordinator | null = null;

  (data || []).forEach((student: any) => {
    if (student.teachers) {
      student.teachers.forEach((t: Teacher) => {
        if (!teachersSet.has(t.id)) teachersSet.set(t.id, t);
      });
    }

    if (
      !coordinator &&
      student.coordinator &&
      student.coordinator.role?.name === "coordinator"
    ) {
      coordinator = {
        id: student.coordinator.id,
        name: student.coordinator.name,
        roleName: student.coordinator.role?.name ?? "",
      };
    }
  });

  return {
    students: data,
    teachers: Array.from(teachersSet.values()),
    coordinator: coordinator || { id: "", name: "", roleName: "" },
  };
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return student;
}

export async function updateStudent(
  id: string,
  updates: Partial<Omit<Student, "id" | "created_at" | "created_by">>
): Promise<Student> {
  const { data: student, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return student;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
