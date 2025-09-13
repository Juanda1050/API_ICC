import fs from "fs";
import csv from "csv-parser";
import ExcelJS from "exceljs";
import { CSVStudent } from "../types/student.types";

export async function parseCSV(filePath: string): Promise<CSVStudent[]> {
  return new Promise((resolve, reject) => {
    const results: CSVStudent[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        const student: CSVStudent = {
          name: data.name,
          paternal_surname: data.paternal_surname,
          maternal_surname: data.maternal_surname,
          list_number: parseInt(data.list_number, 10),
          group: data.group,
          grade: data.grade,
          school: data.school,
        };

        if (
          student.name &&
          student.paternal_surname &&
          student.maternal_surname &&
          student.list_number &&
          student.group &&
          student.grade &&
          student.school
        )
          results.push(student);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

export async function parseExcel(filepath: string): Promise<CSVStudent[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filepath);
    const worksheet = workbook.worksheets[0];
    const students: CSVStudent[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const [
        name,
        paternal_surname,
        maternal_surname,
        list_number,
        group,
        grade,
        school,
      ] = row.values as Array<string | number | undefined>;
      if (
        typeof name === "string" &&
        typeof paternal_surname === "string" &&
        typeof maternal_surname === "string" &&
        typeof list_number === "number" &&
        typeof group === "string" &&
        typeof grade === "string" &&
        typeof school === "string"
      ) {
        students.push({
          name,
          paternal_surname,
          maternal_surname,
          list_number,
          group,
          grade,
          school,
        });
      }
    });
    return students;
  } catch (error) {
    throw new Error("Error parsing Excel file");
  }
}

export async function cleanUpFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
}
