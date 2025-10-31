import PDFDocument from "pdfkit";
import { Response } from "express";
import { IEvent, EventFilter } from "../types/event.types";
import { getEventsService } from "./event.service";
import { getEventStockService } from "./stock.service";
import { Stock } from "../types/stock.types";
import path from "path";
import fs from "fs";
import { pipeline } from "stream";
import {
  drawEventInfoBox,
  drawHeader,
  drawTotalsFooterRight,
} from "../utils/pdf";

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
    const events: IEvent[] = await getEventsService({});
    const event = events.find((e) => e.id === eventId);
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
        if (!res.headersSent)
          res.status(500).json({ error: "Error al generar PDF" });
        else
          try {
            res.destroy(err);
          } catch {}
      }
    });

    const headerImage = await loadHeaderImageCached();
    const headerGenerationDate = `Generado: ${new Date(
      Date.now() - 6 * 60 * 60 * 1000
    ).toLocaleString("es-MX")}`;

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - margin * 2;

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

    drawHeader(doc, pageWidth, margin, contentWidth, {
      title: event.name || "Evento",
      headerImage,
      rightTopText: headerGenerationDate,
      rightBottomText: "Primaria Mayor",
    });
    drawEventInfoBox(doc, event, margin, contentWidth);

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
        drawHeader(doc, pageWidth, margin, contentWidth, {
          title: event.name || "Evento",
          headerImage,
          rightTopText: headerGenerationDate,
          rightBottomText: "Primaria Mayor",
        });
        doc.moveDown(0.5);
        yCursor = drawTableHeader(doc.y + 4);
      }
      const nextY = drawTableRow(yCursor, stock, alt % 2 === 0);
      yCursor = nextY;
      alt++;
    }

    const totalSpent = stocks.reduce((s, it) => s + Number(it.spent_in), 0);
    const totalSales = stocks.reduce((s, it) => s + Number(it.total_sales), 0);

    if (doc.y > pageHeight - margin - 120) {
      doc.addPage();
      drawHeader(doc, pageWidth, margin, contentWidth, {
        title: event.name || "Evento",
        headerImage,
        rightTopText: headerGenerationDate,
        rightBottomText: "Primaria Mayor",
      });
    }

    drawTotalsFooterRight(doc, pageWidth, margin, contentWidth, {
      totalSpent,
      totalSales,
      totalLabel: true,
    });
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
    const events: IEvent[] = await getEventsService(filter);

    const doc = new PDFDocument({
      margin: 48,
      size: "Letter",
      layout: "landscape",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=misiones_${Date.now()}.pdf`
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
    const headerGenerationDate = `Generado: ${new Date(
      Date.now() - 6 * 60 * 60 * 1000
    ).toLocaleString("es-MX")}`;

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = doc.page.margins.left;
    const contentWidth = pageWidth - margin * 2;

    const tableWidth = Math.round(contentWidth * 0.98);
    const tableX = margin + Math.round((contentWidth - tableWidth) / 2);

    const colWidths = {
      name: Math.floor(tableWidth * 0.24),
      place: Math.floor(tableWidth * 0.18),
      date: Math.floor(tableWidth * 0.12),
      spent: Math.floor(tableWidth * 0.1),
      profit: Math.floor(tableWidth * 0.1),
      total: 0,
    };

    const used =
      colWidths.name +
      colWidths.place +
      colWidths.date +
      colWidths.spent +
      colWidths.profit;
    colWidths.total = tableWidth - used;
    if (colWidths.total < 0) colWidths.total = 0;

    const colXPositions = (() => {
      const xs: number[] = [];
      let x = tableX;
      xs.push(x);
      x += colWidths.name;
      xs.push(x);
      x += colWidths.place;
      xs.push(x);
      x += colWidths.date;
      xs.push(x);
      x += colWidths.spent;
      xs.push(x);
      x += colWidths.profit;
      xs.push(x);
      return xs;
    })();

    const headerRowH = 22;
    const rowPad = 5;

    const drawTableHeader = (yTop: number) => {
      doc.save();
      doc.rect(tableX, yTop, tableWidth, headerRowH).fill("#0b3b5c");
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(9);
      doc.text("Nombre", colXPositions[0] + rowPad, yTop + 6, {
        width: colWidths.name - rowPad * 2,
        align: "left",
      });
      doc.text("Escuela", colXPositions[1] + 2, yTop + 6, {
        width: colWidths.place - rowPad,
        align: "left",
      });
      doc.text("Fecha", colXPositions[2], yTop + 6, {
        width: colWidths.date - rowPad,
        align: "center",
      });
      doc.text("Gasto", colXPositions[3], yTop + 6, {
        width: colWidths.spent - rowPad,
        align: "center",
      });
      doc.text("Ganancia", colXPositions[4], yTop + 6, {
        width: colWidths.profit - rowPad,
        align: "right",
      });
      doc.text("Ventas Totales", colXPositions[5], yTop + 6, {
        width: colWidths.total - rowPad,
        align: "right",
      });
      doc.restore();
      return yTop + headerRowH + 6;
    };

    const drawTableRow = (yTop: number, ev: IEvent, isAlt: boolean) => {
      if (isAlt) {
        doc.save();
        doc.rect(tableX, yTop - 2, tableWidth, 20).fill("#fbfcfd");
        doc.restore();
      }

      const fmt = (n?: number) =>
        typeof n === "number" ? `$${n.toFixed(2)}` : "—";
      doc.font("Helvetica").fontSize(11).fillColor("#000");

      doc.text(ev.name || "—", colXPositions[0] + rowPad, yTop, {
        width: colWidths.name - rowPad * 2,
        align: "left",
      });
      doc.text(ev.place || "—", colXPositions[1] + 2, yTop, {
        width: colWidths.place - rowPad,
        align: "left",
      });
      doc.text(
        new Date(ev.event_date).toLocaleDateString("es-MX"),
        colXPositions[2],
        yTop,
        { width: colWidths.date - rowPad, align: "center" }
      );
      doc.text(fmt(ev.spent), colXPositions[3], yTop, {
        width: colWidths.spent - rowPad,
        align: "center",
      });
      doc.text(fmt(ev.profit), colXPositions[4], yTop, {
        width: colWidths.profit - rowPad,
        align: "right",
      });
      doc.text(fmt(ev.total_amount), colXPositions[5], yTop, {
        width: colWidths.total - rowPad,
        align: "right",
      });

      return yTop + 20;
    };

    drawHeader(doc, pageWidth, margin, contentWidth, {
      title: "LISTADO DE EVENTOS",
      headerImage,
      rightTopText: headerGenerationDate,
      rightBottomText: "Primaria Mayor",
    });
    doc.moveDown(0.2);

    doc.font("Helvetica-Bold").fontSize(13).fillColor("#0b3b5c");
    doc.text("Eventos", tableX, doc.y, { width: tableWidth, align: "center" });
    doc.moveDown(0.4);

    let yCursor = drawTableHeader(doc.y + 4);
    let rowIndex = 0;
    for (const ev of events) {
      const estimatedHeight = 20;
      const footerReserve = 120;
      if (yCursor + estimatedHeight > pageHeight - margin - footerReserve) {
        doc.addPage();
        drawHeader(doc, pageWidth, margin, contentWidth, {
          title: "LISTADO DE EVENTOS",
          headerImage,
          rightTopText: headerGenerationDate,
          rightBottomText: "Primaria Mayor",
        });
        doc.moveDown(0.5);
        yCursor = drawTableHeader(doc.y + 4);
      }

      yCursor = drawTableRow(yCursor, ev, rowIndex % 2 === 0);
      rowIndex++;
    }

    const totalSpent = events.reduce((s, e) => s + (Number(e.spent) || 0), 0);
    const totalProfit = events.reduce((s, e) => s + (Number(e.profit) || 0), 0);
    const totalEvents = events.length;

    if (yCursor > pageHeight - margin - 120) {
      doc.addPage();
      drawHeader(doc, pageWidth, margin, contentWidth, {
        title: "LISTADO DE EVENTOS",
        headerImage,
        rightTopText: headerGenerationDate,
        rightBottomText: "Primaria Mayor",
      });
      yCursor = doc.y + 20;
    }

    drawTotalsFooterRight(doc, pageWidth, margin, contentWidth, {
      totalEvents,
      totalSpent,
      totalSales: totalProfit,
      totalLabel: false,
    });

    doc.end();
  } catch (error: unknown) {
    console.error("Error al generar PDF listado:", error);
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
