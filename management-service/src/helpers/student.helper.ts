import {
  createStudentsService,
  findSchoolGroupIdService,
} from "../services/student.service";
import { CSVStudent, Student } from "../types/student.types";

export async function insertStudents(studentsData: any[], createdBy: string) {
  if (!studentsData || studentsData.length === 0)
    throw new Error("No students data provided");

  const dataToInsert = studentsData.map((s) => ({
    ...s,
    created_by: createdBy,
    created_at: new Date(),
  }));

  return await createStudentsService(dataToInsert);
}

export async function mapCSVStudentsToStudents(
  csvStudents: CSVStudent[]
): Promise<
  Omit<
    Student,
    "id" | "created_by" | "created_at" | "updated_by" | "updated_at"
  >[]
> {
  const students: Omit<
    Student,
    "id" | "created_by" | "created_at" | "updated_by" | "updated_at"
  >[] = [];

  for (const csvStudent of csvStudents) {
    const schoolGroupId = await findSchoolGroupIdService(
      csvStudent.school,
      csvStudent.group,
      csvStudent.grade
    );

    if (!schoolGroupId) {
      console.warn(
        `No school group found for: ${csvStudent.name} ${csvStudent.paternal_surname} / ${csvStudent.school} - ${csvStudent.group} - ${csvStudent.grade}`
      );
      continue;
    }

    students.push({
      name: csvStudent.name,
      paternal_surname: csvStudent.paternal_surname,
      maternal_surname: csvStudent.maternal_surname,
      list_number: csvStudent.list_number,
      schoolGroup_id: schoolGroupId,
    });
  }

  return students;
}
