import PDFDocument from "pdfkit";
import { Student } from "../types/student.types";

export async function generateGroupTickets(
  students: Student[],
  group: string,
  grade: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 15, left: 15, right: 15, bottom: 15 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const ticketsPerRow = 2;
      const ticketsPerColumn = 3;
      const ticketWidth = (doc.page.width - 45) / ticketsPerRow;
      const ticketHeight = (doc.page.height - 60) / ticketsPerColumn;

      let count = 0;

      students.forEach((student, index) => {
        const row = Math.floor(count / ticketsPerRow) % ticketsPerColumn;
        const col = count % ticketsPerRow;

        const x = 20 + col * ticketWidth;
        const y = 20 + row * ticketHeight;
        drawTicketBackground(doc, x, y, ticketWidth - 10, ticketHeight - 10);
        drawModernHeader(doc, x, y, ticketWidth - 10, grade, group);
        drawListNumberBox(
          doc,
          x + ticketWidth - 60,
          y + 8,
          student.list_number
        );
        draw3DStudentName(doc, x + 15, y + 45, student.name, ticketWidth - 30);
        drawEventInfo(doc, x + 15, y + 70, ticketWidth - 30);
        drawSignatureFields(
          doc,
          x + 15,
          y + ticketHeight - 60,
          ticketWidth - 30
        );

        count++;

        // Nueva página cada 6 tickets
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

function drawTicketBackground(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  doc.roundedRect(x, y, width, height, 8).fillAndStroke("#f8f9fa", "#e9ecef");

  doc.opacity(0.1);
  drawGraduationCapWatermark(doc, x + width / 2, y + height / 2);
  doc.opacity(1);

  doc.roundedRect(x + 2, y + 2, width - 4, height - 4, 6).stroke("#6c757d");
}

function drawGraduationCapWatermark(
  doc: PDFKit.PDFDocument,
  centerX: number,
  centerY: number
): void {
  doc.rect(centerX - 25, centerY - 10, 50, 20).fill("#dee2e6");

  doc.rect(centerX - 20, centerY - 15, 40, 8).fill("#dee2e6");

  doc.circle(centerX + 25, centerY - 20, 4).fill("#dee2e6");

  doc
    .moveTo(centerX + 20, centerY - 15)
    .lineTo(centerX + 25, centerY - 16)
    .stroke("#dee2e6");
}

function drawModernHeader(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  grade: string,
  group: string
): void {
  doc.rect(x + 5, y + 5, width - 10, 35).fill("#4f46e5");

  doc.rect(x + 7, y + 7, width - 14, 35).fill("#6366f1");

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#1f2937")
    .text("GRADUACIÓN", x + 17, y + 17, { width: width - 20, align: "center" });

  doc
    .fillColor("#ffffff")
    .text("GRADUACIÓN", x + 15, y + 15, { width: width - 20, align: "center" });

  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .fillColor("#fbbf24")
    .text(`${grade}${group}`, x + 22, y + 32, {
      width: width - 30,
      align: "left",
    });

  doc.fillColor("#f59e0b").text(`${grade}${group}`, x + 20, y + 30, {
    width: width - 30,
    align: "left",
  });
}

function drawListNumberBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  listNumber: number
): void {
  doc.rect(x, y, 40, 28).fillAndStroke("#ef4444", "#dc2626");

  doc.rect(x + 2, y + 2, 40, 28).fillAndStroke("#f87171", "#ef4444");

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#ffffff")
    .text("No.", x + 12, y + 6, { width: 20, align: "center" });

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#ffffff")
    .text(listNumber.toString(), x + 5, y + 16, { width: 30, align: "center" });
}

function draw3DStudentName(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  name: string,
  width: number
): void {
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#374151")
    .text(name, x + 2, y + 2, { width: width, align: "left" });

  doc.fillColor("#111827").text(name, x, y, { width: width, align: "left" });

  doc
    .moveTo(x, y + 20)
    .lineTo(x + Math.min(name.length * 6, width), y + 20)
    .strokeColor("#6366f1")
    .lineWidth(2)
    .stroke();
}

function drawEventInfo(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number
): void {
  const lineHeight = 15;
  let currentY = y;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#059669")
    .text("💰 Cantidad: ", x, currentY);

  doc
    .font("Helvetica")
    .fillColor("#6b7280")
    .text("__________________", x + 65, currentY);

  currentY += lineHeight;

  doc
    .font("Helvetica-Bold")
    .fillColor("#7c3aed")
    .text("🎉 Concepto: ", x, currentY);

  doc
    .font("Helvetica")
    .fillColor("#374151")
    .text("Fiesta de Graduación", x + 65, currentY);

  currentY += lineHeight;

  doc
    .font("Helvetica-Bold")
    .fillColor("#dc2626")
    .text("🎓 Generación: ", x, currentY);

  doc
    .font("Helvetica")
    .fillColor("#374151")
    .text("2019-2025", x + 85, currentY);

  currentY += lineHeight;

  doc
    .font("Helvetica-Bold")
    .fillColor("#0891b2")
    .text("📍 San Nicolás de los Garza N.L.", x, currentY);

  currentY += 8;
  doc
    .font("Helvetica")
    .fillColor("#6b7280")
    .text("Fecha: _______________", x + 10, currentY);
}

function drawSignatureFields(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number
): void {
  const fieldWidth = (width - 10) / 2;

  // Campo padre/tutor
  doc.rect(x, y, fieldWidth, 25).fillAndStroke("#ecfdf5", "#22c55e");

  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .fillColor("#166534")
    .text("👨‍👩‍👧‍👦 Padre/Tutor:", x + 5, y + 3);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text("_________________", x + 5, y + 13);

  // Campo recibe
  doc
    .rect(x + fieldWidth + 10, y, fieldWidth, 25)
    .fillAndStroke("#fef3c7", "#f59e0b");

  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .fillColor("#92400e")
    .text("✅ Recibe:", x + fieldWidth + 15, y + 3);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text("_________________", x + fieldWidth + 15, y + 13);
}
