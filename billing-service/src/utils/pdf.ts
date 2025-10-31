import fs from "fs";
import path from "path";
import { HeaderOptions, IEvent } from "../types/event.types";

const DEFAULT_HEADER_IMAGE_CANDIDATES = [
  path.resolve(process.cwd(), "assets", "icc.png"),
  path.resolve(process.cwd(), "billing-service", "assets", "icc.png"),
  path.resolve(process.cwd(), "billing-service", "public", "icc.png"),
  path.resolve(process.cwd(), "src", "assets", "icc.png"),
  "/usr/src/app/assets/icc.png",
  "/usr/src/app/billing-service/assets/icc.png",
];

let headerImageBufferCache: Buffer | null | undefined = undefined;

export async function loadHeaderImageCached(
  candidates: string[] = DEFAULT_HEADER_IMAGE_CANDIDATES
): Promise<Buffer | undefined> {
  if (headerImageBufferCache !== undefined)
    return headerImageBufferCache ?? undefined;

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      if (fs.existsSync(candidate)) {
        const buf = await fs.promises.readFile(candidate);
        headerImageBufferCache = buf;
        return buf;
      }
    } catch (err) {
      console.warn("Error leyendo candidate header image:", candidate, err);
    }
  }

  headerImageBufferCache = null;
  return undefined;
}

export function safeFilename(name: string): string {
  return String(name)
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");
}

export function fmtAmount(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number" && isFinite(value))
    return `$${value.toFixed(2)}`;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/\s+/g, ""));
    if (!Number.isNaN(parsed) && isFinite(parsed))
      return `$${parsed.toFixed(2)}`;
    return value;
  }
  const coerced = Number(value as any);
  if (!Number.isNaN(coerced) && isFinite(coerced))
    return `$${coerced.toFixed(2)}`;
  return "—";
}

export function drawHeader(
  doc: PDFKit.PDFDocument,
  pageWidth: number,
  margin: number,
  contentWidth: number,
  opts: HeaderOptions
) {
  const headerHeight = opts.headerHeight ?? 80;
  const headerTop = margin - 24;
  const titleFontSize = 18;
  const titleY = headerTop + Math.max(0, (headerHeight - titleFontSize) / 2);

  doc.save();
  doc
    .fillColor("#f6f9fb")
    .rect(margin - 8, headerTop, contentWidth + 16, headerHeight)
    .fill();
  doc.fillColor("#000");

  if (opts.headerImage) {
    try {
      const logoMaxW = 120;
      const logoMaxH = 60;
      const logoY = headerTop + Math.max(0, (headerHeight - logoMaxH) / 2);
      const logoX = margin;
      doc.image(opts.headerImage, logoX, logoY, { fit: [logoMaxW, logoMaxH] });
    } catch (e) {
      console.warn("No se pudo dibujar la imagen en el header:", e);
    }
  }

  doc.font("Helvetica-Bold").fontSize(titleFontSize).fillColor("#0b3b5c");
  doc.text(opts.title, margin, titleY, {
    width: contentWidth,
    align: "center",
  });

  if (opts.rightTopText || opts.rightBottomText) {
    const rightBoxWidth = 160;
    const rightBoxX = pageWidth - margin - rightBoxWidth;
    const rightBoxY = margin - 8;
    if (opts.rightTopText) {
      doc.font("Helvetica").fontSize(9).fillColor("#444");
      doc.text(opts.rightTopText, rightBoxX, rightBoxY, {
        width: rightBoxWidth,
        align: "right",
      });
    }
    if (opts.rightBottomText) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#333");
      doc.text(opts.rightBottomText, rightBoxX, rightBoxY + 16, {
        width: rightBoxWidth,
        align: "right",
      });
    }
  }

  doc
    .strokeColor("#e0e6ea")
    .lineWidth(1)
    .moveTo(margin, margin + headerHeight - 8)
    .lineTo(pageWidth - margin, margin + headerHeight - 8)
    .stroke();
  doc.restore();

  doc.y = margin + headerHeight - 2;
}

export function drawEventInfoBox(
  doc: PDFKit.PDFDocument,
  event: Partial<IEvent>,
  margin: number,
  contentWidth: number
) {
  const infoBoxY = doc.y + 10;
  const infoBoxH = 72;

  doc.save();
  doc
    .fillColor("#eef6fb")
    .rect(margin, infoBoxY, contentWidth, infoBoxH)
    .fill();
  doc.fillColor("#0b3b5c").rect(margin, infoBoxY, 10, infoBoxH).fill();
  doc.fillColor("#000");

  const innerLeft = margin + 16;
  const leftColX = innerLeft;
  const rightColX = margin + Math.round(contentWidth / 2) + 12;

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#0b3b5c")
    .text("Información General", leftColX, infoBoxY + 8);

  doc.font("Helvetica").fontSize(11).fillColor("#333");

  doc
    .font("Helvetica-Bold")
    .text("Escuela: ", leftColX, infoBoxY + 30, { continued: true });
  doc.font("Helvetica").text(String(event.place ?? "—"));

  doc
    .font("Helvetica-Bold")
    .text("Total Gastado: ", leftColX, infoBoxY + 48, { continued: true });
  doc.font("Helvetica").text(fmtAmount(event.spent ?? null));

  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString("es-MX")
    : "—";
  doc
    .font("Helvetica-Bold")
    .text("Fecha: ", rightColX, infoBoxY + 30, { continued: true });
  doc.font("Helvetica").text(dateStr);

  doc
    .font("Helvetica-Bold")
    .text("Ganancia: ", rightColX, infoBoxY + 48, { continued: true });
  doc.font("Helvetica").text(fmtAmount(event.profit ?? null));

  doc.restore();

  doc.y = infoBoxY + infoBoxH + 12;
}

export function drawTotalsFooterRight(
  doc: PDFKit.PDFDocument,
  pageWidth: number,
  margin: number,
  contentWidth: number,
  opts: {
    totalLabel: boolean;
    totalSpent: number;
    totalSales: number;
    totalEvents?: number;
  }
) {
  const boxW = Math.min(420, Math.round(contentWidth * 0.5));
  const boxH = 65;
  const boxX = pageWidth - margin - boxW;
  const boxY = doc.y + 18;

  doc.save();
  doc.fillColor("#f7fbf8");
  doc.strokeColor("#e6f0ea").lineWidth(1);
  doc.roundedRect(boxX, boxY, boxW, boxH, 6).fill().stroke();

  const labelX = boxX + 12;
  const valueWidth = boxW - 24;

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#333");
  if (typeof opts.totalEvents === "number") {
    doc.text("Total Eventos:", labelX, boxY + 8);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#0b3b5c")
      .text(String(opts.totalEvents), labelX, boxY + 8, {
        width: valueWidth,
        align: "right",
      });
  }

  if (opts.totalLabel) {
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#333")
      .text("Total Ventas:", labelX, boxY + 8);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#0b3b5c")
      .text(fmtAmount(opts.totalSales), labelX, boxY + 8, {
        width: valueWidth,
        align: "right",
      });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#333")
    .text("Total Gastado:", labelX, boxY + 26);
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#0b3b5c")
    .text(fmtAmount(opts.totalSpent), labelX, boxY + 26, {
      width: valueWidth,
      align: "right",
    });

  const net = opts.totalLabel
    ? opts.totalSales - opts.totalSpent
    : opts.totalSales;
  const netColor = net >= 0 ? "#0b8a4f" : "#b20000";
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(netColor)
    .text("Ganancia Total:", labelX, boxY + 44);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(netColor)
    .text(fmtAmount(net), labelX, boxY + 44, {
      width: valueWidth,
      align: "right",
    });

  doc.restore();
}
