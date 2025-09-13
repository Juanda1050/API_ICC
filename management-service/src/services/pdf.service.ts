import PDFDocument from "pdfkit";
import { Student } from "../types/student.types";
import { defaultColors, groupColors } from "../utils/colors";

const COLORS = {
  main: "#212F84",
  accent: "#3646b3",
  soft: "#facc15",
  dark: "#111827",
  text: "#374151",
  bg: "#f3f4f6",
};

export async function generateGroupTickets(
  students: Student[],
  group: string,
  grade: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "Letter",
        margins: { top: 15, left: 20, right: 20, bottom: 15 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const ticketsPerRow = 1;
      const ticketsPerColumn = 3;
      const ticketWidth = (doc.page.width - 60) / ticketsPerRow;
      const ticketHeight = (doc.page.height - 60) / ticketsPerColumn;

      let count = 0;

      students.forEach((student, index) => {
        const row = Math.floor(count / ticketsPerRow) % ticketsPerColumn;
        const col = count % ticketsPerRow;

        const x = 30 + col * ticketWidth;
        const y = 30 + row * ticketHeight;

        drawTicket(
          doc,
          x,
          y,
          ticketWidth - 10,
          ticketHeight - 10,
          grade,
          group,
          student
        );

        count++;

        if (
          count % (ticketsPerRow * ticketsPerColumn) === 0 &&
          index < students.length - 1
        ) {
          doc.addPage();
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function drawTicket(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  grade: string,
  group: string,
  student: Student
) {
  const colors = groupColors[`${grade}${group}`] || defaultColors;

  doc.roundedRect(x, y, width, height, 12).stroke(colors.accent);
  doc.roundedRect(x + 3, y + 3, width - 6, height - 6, 10).stroke(colors.main);

  const midX = x + width / 2;
  doc
    .moveTo(midX, y)
    .lineTo(midX, y + height)
    .lineWidth(1)
    .stroke(COLORS.accent);

  drawHeader(doc, x, y, width / 2, grade, group, student.list_number, colors);
  drawHeader(
    doc,
    midX,
    y,
    width / 2,
    grade,
    group,
    student.list_number,
    colors
  );

  drawStudentInfo(
    doc,
    x + 15,
    y + 65,
    width / 2 - 30,
    `${student.name} ${student.paternal_surname} ${student.maternal_surname}`,
    true,
    colors
  );
  drawStudentInfo(
    doc,
    midX + 15,
    y + 65,
    width / 2 - 30,
    `${student.name} ${student.paternal_surname} ${student.maternal_surname}`,
    false,
    colors
  );

  drawEventInfo(
    doc,
    x + 15,
    y + 110,
    width / 2 - 30,
    false,
    `${student.name} ${student.paternal_surname} ${student.maternal_surname}`,
    colors
  );
  drawEventInfo(
    doc,
    midX + 15,
    y + 105,
    width / 2 - 30,
    true,
    `${student.name} ${student.paternal_surname} ${student.maternal_surname}`,
    colors
  );

  drawSignature(
    doc,
    x + 15,
    y + height - 50,
    width / 2 - 30,
    "Padre/Tutor",
    colors
  );
  drawSignature(
    doc,
    midX + 15,
    y + height - 25,
    width / 2 - 30,
    "Recibe",
    colors
  );
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  grade: string,
  group: string,
  listNumber: number,
  colors: typeof defaultColors
) {
  const headerHeight = 45;
  const centerY = y + headerHeight / 2;

  doc
    .roundedRect(x, y, width, headerHeight, 8)
    .fill(colors.main)
    .stroke(colors.dark);
  doc.roundedRect(x, y, width, 20, 8).fill(colors.accent);

  const centerFontSize = 14;
  const centerOffset = centerFontSize * 0.35;
  doc
    .fillColor("#000000")
    .font("Helvetica-Bold")
    .fontSize(centerFontSize)
    .text("Fiesta de Graduación", x, centerY - centerOffset + 1, {
      width,
      align: "center",
    });
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(centerFontSize)
    .text("Fiesta de Graduación", x, centerY - centerOffset, {
      width,
      align: "center",
    });

  const sideFontSize = 16;
  const sideOffset = sideFontSize * 0.35;
  doc
    .fillColor("#000000")
    .font("Helvetica-Bold")
    .fontSize(sideFontSize)
    .text(`${grade}${group}`, x + 22, centerY - sideOffset + 1);
  doc
    .fillColor(colors.soft)
    .font("Helvetica-Bold")
    .fontSize(sideFontSize)
    .text(`${grade}${group}`, x + 20, centerY - sideOffset);

  const boxWidth = 45;
  const boxHeight = 25;
  const boxY = centerY - boxHeight / 2;

  doc
    .roundedRect(x + width - boxWidth - 10, boxY, boxWidth, boxHeight, 5)
    .fillAndStroke("#ffffff", colors.dark);

  doc
    .fillColor(colors.dark)
    .fontSize(8)
    .text("No. Lista", x + width - boxWidth - 10, boxY + 3, {
      width: boxWidth,
      align: "center",
    });

  doc
    .fillColor(colors.accent)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(listNumber.toString(), x + width - boxWidth - 10, boxY + 10, {
      width: boxWidth,
      align: "center",
    });
}

function drawStudentInfo(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  studentName: string,
  isTutor: boolean = true,
  colors: typeof defaultColors
) {
  if (isTutor)
    doc
      .fillColor(colors.dark)
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(studentName, x, y, { width, align: "center" });
  else
    doc
      .fillColor(colors.dark)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Fiesta de Graduación de Primaria Generación 2020 - 2026", x, y, {
        width,
        align: "center",
      });
}

function drawEventInfo(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  isTutor: boolean = false,
  studentName: string,
  colors: typeof defaultColors
) {
  const lineHeight = 16;
  let cy = y;

  if (!isTutor) {
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(colors.accent)
      .text("Cantidad: ___________", x, cy);
    cy += lineHeight;

    doc
      .fontSize(10)
      .fillColor(colors.accent)
      .text("Concepto: ", x, cy, { continued: true })
      .fillColor(colors.text)
      .font("Helvetica-Bold")
      .text("Fiesta de Graduación de Primaria");
    cy += lineHeight;

    doc
      .font("Helvetica-Bold")
      .fillColor(colors.dark)
      .text("Generación 2020 - 2026", x, cy);
    cy += lineHeight;

    doc
      .fillColor(colors.text)
      .font("Helvetica")
      .text("San Nicolás de los Garza, N.L. a: ____________", x, cy, {
        width,
      });
  } else {
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(colors.text)
      .text("Recibí del padre o tutor: ____________________", x, cy);
    cy += lineHeight;

    doc
      .font("Helvetica")
      .fillColor(colors.text)
      .text("del alumno: ", x, cy, { continued: true })
      .font("Helvetica-Bold")
      .text(studentName || "");
    cy += lineHeight;

    doc
      .font("Helvetica")
      .fillColor(colors.text)
      .text("La cantidad de: ____________________", x, cy);
    cy += lineHeight;

    doc
      .font("Helvetica")
      .fillColor(colors.text)
      .text("por concepto de: ", x, cy, { continued: true })
      .font("Helvetica-Bold")
      .text("Fiesta de Graduación de Primaria");
    cy += lineHeight;

    doc
      .font("Helvetica-Bold")
      .fillColor(colors.dark)
      .text("Generación 2020 - 2026", x, cy);
    cy += lineHeight;

    doc
      .font("Helvetica")
      .fillColor(colors.text)
      .text("San Nicolás de los Garza, N.L. a: ____________", x, cy);
  }
}

function drawSignature(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  label: string,
  colors: typeof defaultColors
) {
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor(colors.accent)
    .text(`${label}: ____________________`, x, y, { width });
}
