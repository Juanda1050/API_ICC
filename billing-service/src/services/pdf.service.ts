import PDFDocument from "pdfkit";
import { Response } from "express";
import { Event, EventFilter } from "../types/event.types";
import { getEventsService } from "./event.service";
import { getEventStockService } from "./stock.service";
import { Stock } from "../types/stock.types";
import path from "path";
import fs from "fs";
import { pipeline } from "stream";

const DEFAULT_HEADER_IMAGE_CANDIDATES = [
  path.resolve(process.cwd(), "assets", "icc.png"),
  path.resolve(process.cwd(), "billing-service", "assets", "icc.png"),
  path.resolve(process.cwd(), "billing-service", "public", "icc.png"),
  path.resolve(process.cwd(), "src", "assets", "icc.png"),
  "/usr/src/app/assets/icc.png",
  "/usr/src/app/billing-service/assets/icc.png",
];
let headerImageBufferCache: Buffer | null | undefined = undefined;

async function loadHeaderImageCached(): Promise<Buffer | undefined> {
  if (headerImageBufferCache !== undefined)
    return headerImageBufferCache ?? undefined;

  for (const candidate of DEFAULT_HEADER_IMAGE_CANDIDATES) {
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

function safeFilename(name: string): string {
  return String(name)
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");
}

export async function exportEventToPDFService(
  eventId: string,
  res: Response
): Promise<void> {
  try {
    const events: Event[] = await getEventsService({});
    const event: Event | undefined = events.find((e) => e.id === eventId);

    if (!event) {
      res.status(404).json({ error: "Evento no encontrado" });
      return;
    }

    const stocks: Stock[] = await getEventStockService(eventId);

    const doc = new PDFDocument({ margin: 48, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=evento_${safeFilename(event.name)}_${eventId}.pdf`
    );

    const onClose = () => {
      try {
        (doc as any).destroy?.();
      } catch {}
    };
    res.on("close", onClose);

    pipeline(doc, res, (err) => {
      res.off("close", onClose);
      if (err) {
        console.error("PDF pipeline error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error al generar PDF" });
        } else {
          try {
            res.destroy(err);
          } catch {}
        }
      }
    });

    const headerImage = await loadHeaderImageCached();

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - margin * 2;

    const headerHeight = 80;
    const headerTop = margin - 24;
    const titleFontSize = 18;
    doc.font("Helvetica-Bold").fontSize(titleFontSize).fillColor("#0b3b5c");
    const titleY = headerTop + Math.max(0, (headerHeight - titleFontSize) / 2);

    const drawHeader = () => {
      doc.save();
      doc
        .fillColor("#f6f9fb")
        .rect(margin - 8, margin - 24, contentWidth + 16, headerHeight)
        .fill();
      doc.fillColor("#000");

      if (headerImage) {
        try {
          const logoMaxW = 120;
          const logoMaxH = 60;
          const logoY =
            margin - 24 + Math.max(0, (headerHeight - logoMaxH) / 2);
          const logoX = margin;
          doc.image(headerImage, logoX, logoY, { fit: [logoMaxW, logoMaxH] });
        } catch (e) {
          console.warn("No se pudo dibujar la imagen en el header:", e);
        }
      }

      doc.font("Helvetica-Bold").fontSize(18).fillColor("#0b3b5c");
      doc.text(String(event.name || "Evento"), margin, titleY, {
        width: contentWidth,
        align: "center",
      });

      const rightBoxWidth = 160;
      const rightBoxX = pageWidth - margin - rightBoxWidth;
      const rightBoxY = margin - 8;

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#333");
      doc.text("Primaria Mayor", rightBoxX, rightBoxY, {
        width: rightBoxWidth,
        align: "right",
      });

      doc
        .strokeColor("#e0e6ea")
        .lineWidth(1)
        .moveTo(margin, margin + headerHeight - 8)
        .lineTo(pageWidth - margin, margin + headerHeight - 8)
        .stroke();

      doc.restore();

      doc.y = margin + headerHeight - 2;
    };

    const drawInfoBox = () => {
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
      doc.font("Helvetica").text(String(event.place));

      doc
        .font("Helvetica-Bold")
        .text("Gasto Total: ", leftColX, infoBoxY + 48, { continued: true });
      doc.font("Helvetica").text(`$${Number(event.spent).toFixed(2)}`);

      doc
        .font("Helvetica-Bold")
        .text("Fecha: ", rightColX, infoBoxY + 30, { continued: true });
      doc
        .font("Helvetica")
        .text(`${new Date(event.event_date).toLocaleDateString("es-MX")}`);

      doc
        .font("Helvetica-Bold")
        .text("Ganancia: ", rightColX, infoBoxY + 48, { continued: true });
      doc.font("Helvetica").text(`$${Number(event.profit).toFixed(2)}`);

      doc.restore();
      doc.y = infoBoxY + infoBoxH + 12;
    };

    const tableWidth = Math.round(contentWidth * 0.98);
    const tableX = margin + Math.round((contentWidth - tableWidth) / 2);

    const colWidths = {
      product: Math.floor(tableWidth * 0.35),
      spent: Math.floor(tableWidth * 0.12),
      sell: Math.floor(tableWidth * 0.12),
      initial: Math.floor(tableWidth * 0.12),
      remaining: Math.floor(tableWidth * 0.12),
      sales:
        tableWidth -
        (Math.floor(tableWidth * 0.35) + 4 * Math.floor(tableWidth * 0.12)),
    };

    const colXPositions = (() => {
      const xs: number[] = [];
      let x = tableX;
      xs.push(x);
      x += colWidths.product;
      xs.push(x);
      x += colWidths.spent;
      xs.push(x);
      x += colWidths.sell;
      xs.push(x);
      x += colWidths.initial;
      xs.push(x);
      x += colWidths.remaining;
      xs.push(x);
      return xs;
    })();

    const headerRowH = 22;
    const rowPad = 6;

    const drawTableHeader = (yTop: number) => {
      doc.save();
      doc.rect(tableX, yTop, tableWidth, headerRowH).fill("#0b3b5c");
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(10);
      doc.text("Producto", colXPositions[0] + rowPad, yTop + 6, {
        width: colWidths.product - rowPad * 2,
        align: "left",
      });
      doc.text("Gasto", colXPositions[1], yTop + 6, {
        width: colWidths.spent - rowPad,
        align: "right",
      });
      doc.text("Venta", colXPositions[2], yTop + 6, {
        width: colWidths.sell - rowPad,
        align: "right",
      });
      doc.text("Stock Ini.", colXPositions[3], yTop + 6, {
        width: colWidths.initial - rowPad,
        align: "right",
      });
      doc.text("Restante", colXPositions[4], yTop + 6, {
        width: colWidths.remaining - rowPad,
        align: "right",
      });
      doc.text("Ventas Tot.", colXPositions[5], yTop + 6, {
        width: colWidths.sales - rowPad,
        align: "right",
      });
      doc.restore();
      return yTop + headerRowH + 6;
    };

    const drawTableRow = (yTop: number, stock: Stock, isAlt: boolean) => {
      if (isAlt) {
        doc.save();
        doc.rect(tableX, yTop - 2, tableWidth, 26).fill("#fbfcfd");
        doc.restore();
      }

      const fmt = (n: number) => `$${Number(n).toFixed(2)}`;
      doc.font("Helvetica").fontSize(10).fillColor("#000");
      doc.text(stock.product_name, colXPositions[0] + rowPad, yTop, {
        width: colWidths.product - rowPad * 2,
        align: "left",
      });
      doc.text(fmt(stock.spent_in), colXPositions[1], yTop, {
        width: colWidths.spent - rowPad,
        align: "right",
      });
      doc.text(fmt(stock.sell_for), colXPositions[2], yTop, {
        width: colWidths.sell - rowPad,
        align: "right",
      });
      doc.text(String(stock.initial_stock), colXPositions[3], yTop, {
        width: colWidths.initial - rowPad,
        align: "right",
      });
      doc.text(String(stock.remaining_stock), colXPositions[4], yTop, {
        width: colWidths.remaining - rowPad,
        align: "right",
      });
      doc.text(fmt(stock.total_sales), colXPositions[5], yTop, {
        width: colWidths.sales - rowPad,
        align: "right",
      });

      let nextY = yTop + 28;
      return nextY;
    };

    const drawTotalsFooter = (
      yTop: number,
      totalSpent: number,
      totalSales: number
    ) => {
      const boxW = Math.min(420, Math.round(contentWidth * 0.6));
      const boxH = 65;
      const boxX = pageWidth - margin - boxW;
      const boxY = yTop + 18;

      doc.save();

      doc.fillColor("#f7fbf8");
      doc.strokeColor("#e6f0ea").lineWidth(1);
      doc.roundedRect(boxX, boxY, boxW, boxH, 6).fill().stroke();

      const labelX = boxX + 12;
      const valueWidth = boxW - 24;

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#333")
        .text("Total Gastado:", labelX, boxY + 10);
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#0b3b5c")
        .text(`$${totalSpent.toFixed(2)}`, labelX, boxY + 10, {
          width: valueWidth,
          align: "right",
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#333")
        .text("Total Ventas:", labelX, boxY + 28);
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#0b3b5c")
        .text(`$${totalSales.toFixed(2)}`, labelX, boxY + 28, {
          width: valueWidth,
          align: "right",
        });

      const net = totalSales - totalSpent;
      const netColor = net >= 0 ? "#0b8a4f" : "#b20000";
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(netColor)
        .text("Ganancia Neta:", labelX, boxY + 44);
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(netColor)
        .text(`$${net.toFixed(2)}`, labelX, boxY + 44, {
          width: valueWidth,
          align: "right",
        });

      doc.restore();
    };

    drawHeader();
    drawInfoBox();

    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#0b3b5c");
    doc.text("Inventario del Evento", margin, doc.y, {
      width: contentWidth,
      align: "center",
    });
    doc.moveDown(0.4);

    if (!stocks || stocks.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#333")
        .text("No hay inventario registrado para este evento.", {
          align: "center",
        });
      doc.end();
      return;
    }

    let yCursor = drawTableHeader(doc.y + 4);
    let alt = 0;
    for (const stock of stocks) {
      const estimatedRowHeight = 28 + (stock.description ? 16 : 0);
      const spaceForTotals = 140;
      if (yCursor + estimatedRowHeight > pageHeight - margin - spaceForTotals) {
        doc.addPage();
        drawHeader();
        doc.moveDown(0.5);
        yCursor = drawTableHeader(doc.y + 4);
      }
      const nextY = drawTableRow(yCursor, stock, alt % 2 === 0);
      yCursor = nextY;
      alt++;
    }

    const totalSpent = stocks.reduce((s, it) => s + Number(it.spent_in), 0);
    const totalSales = stocks.reduce((s, it) => s + Number(it.total_sales), 0);

    if (yCursor > pageHeight - margin - 120) {
      doc.addPage();
      drawHeader();
      yCursor = doc.y + 20;
    }

    drawTotalsFooter(yCursor, totalSpent, totalSales);

    doc.end();
  } catch (error: unknown) {
    console.error("Error al generar PDF:", error);
    if (!res.headersSent) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(500).json({ error: "Error al generar PDF: " + message });
    } else {
      try {
        res.destroy(error as any);
      } catch {}
    }
  }
}

export async function exportEventsListToPDFService(
  filter: EventFilter,
  res: Response
): Promise<void> {
  try {
    const events: Event[] = await getEventsService(filter);

    const doc = new PDFDocument({
      margin: 50,
      size: "Letter",
      layout: "landscape",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=misiones_${Date.now()}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("LISTADO DE EVENTOS", { align: "center" });
    doc.moveDown();

    if (filter.search || filter.place || filter.event_dates) {
      doc.fontSize(10).font("Helvetica").text("Filtros aplicados:", {
        underline: true,
      });
      if (filter.search) doc.text(`Búsqueda: ${filter.search}`);
      if (filter.place) doc.text(`Lugar: ${filter.place}`);
      if (filter.event_dates && filter.event_dates.length === 2) {
        doc.text(
          `Fechas: ${new Date(filter.event_dates[0]).toLocaleDateString(
            "es-MX"
          )} - ${new Date(filter.event_dates[1]).toLocaleDateString("es-MX")}`
        );
      }
      doc.moveDown();
    }

    const tableTop: number = doc.y;
    const colWidths = {
      name: 150,
      place: 120,
      date: 80,
      spent: 70,
      profit: 70,
      total: 70,
      createdBy: 120,
    };

    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Nombre", 50, tableTop, { width: colWidths.name });
    doc.text("Lugar", 200, tableTop, { width: colWidths.place });
    doc.text("Fecha", 320, tableTop, { width: colWidths.date });
    doc.text("Gasto", 400, tableTop, { width: colWidths.spent });
    doc.text("Ganancia", 470, tableTop, { width: colWidths.profit });
    doc.text("Total", 540, tableTop, { width: colWidths.total });
    doc.text("Creado por", 610, tableTop, { width: colWidths.createdBy });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(750, tableTop + 15)
      .stroke();

    let yPosition: number = tableTop + 25;

    doc.font("Helvetica").fontSize(8);
    events.forEach((event: Event) => {
      if (yPosition > 500) {
        doc.addPage();
        yPosition = 50;
      }

      doc.text(event.name, 50, yPosition, { width: colWidths.name });
      doc.text(event.place, 200, yPosition, { width: colWidths.place });
      doc.text(
        new Date(event.event_date).toLocaleDateString("es-MX"),
        320,
        yPosition,
        { width: colWidths.date }
      );
      doc.text(`$${event.spent.toFixed(2)}`, 400, yPosition, {
        width: colWidths.spent,
      });
      doc.text(`$${event.profit.toFixed(2)}`, 470, yPosition, {
        width: colWidths.profit,
      });
      doc.text(`$${event.total_amount}`, 540, yPosition, {
        width: colWidths.total,
      });
      doc.text((event as any).modified_by || event.created_by, 610, yPosition, {
        width: colWidths.createdBy,
      });

      yPosition += 20;
    });

    doc.moveDown(2);
    const totalSpent: number = events.reduce(
      (sum: number, e: Event) => sum + e.spent,
      0
    );
    const totalProfit: number = events.reduce(
      (sum: number, e: Event) => sum + e.profit,
      0
    );

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Total de Eventos: ${events.length}`);
    doc.text(`Gasto Total: $${totalSpent.toFixed(2)}`);
    doc.text(`Ganancia Total: $${totalProfit.toFixed(2)}`);

    doc.end();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    throw new Error("Error al generar PDF: " + errorMessage);
  }
}
