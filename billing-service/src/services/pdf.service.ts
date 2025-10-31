import PDFDocument from "pdfkit";
import { Response } from "express";
import { Event, EventFilter } from "../types/event.types";
import { getEventsService } from "./event.service";
import { getEventStockService } from "./stock.service";
import { Stock } from "../types/stock.types";

export async function exportEventToPDFService(
  eventId: string,
  res: Response
): Promise<void> {
  try {
    const events: Event[] = await getEventsService({});
    const event: Event | undefined = events.find((e) => e.id === eventId);

    if (!event) {
      throw new Error("Evento no encontrado");
    }

    const stocks: Stock[] = await getEventStockService(eventId);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=evento_${event.name.replace(
        /\s+/g,
        "_"
      )}_${eventId}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("REPORTE DE EVENTO", { align: "center" });
    doc.moveDown();

    doc.fontSize(16).text("Información General", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica");
    doc.text(`Nombre: ${event.name}`);
    doc.text(`Lugar: ${event.place}`);
    doc.text(
      `Fecha del Evento: ${new Date(event.event_date).toLocaleDateString(
        "es-MX"
      )}`
    );
    doc.text(`Gasto Total: $${event.spent.toFixed(2)}`);
    doc.text(`Ganancia: $${event.profit.toFixed(2)}`);
    doc.text(`Monto Total: $${event.total_amount}`);
    doc.text(`Creado por: ${(event as any).modified_by || event.created_by}`);
    doc.text(
      `Fecha de Creación: ${new Date(event.created_at).toLocaleDateString(
        "es-MX"
      )}`
    );
    doc.moveDown(2);

    if (stocks && stocks.length > 0) {
      doc.fontSize(16).font("Helvetica-Bold").text("Inventario del Evento", {
        underline: true,
      });
      doc.moveDown(0.5);

      const tableTop: number = doc.y;
      const colWidths = {
        product: 150,
        spent: 70,
        sell: 70,
        initial: 60,
        remaining: 70,
        sales: 70,
      };

      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Producto", 50, tableTop, { width: colWidths.product });
      doc.text("Gasto", 200, tableTop, { width: colWidths.spent });
      doc.text("Venta", 270, tableTop, { width: colWidths.sell });
      doc.text("Stock Ini.", 340, tableTop, { width: colWidths.initial });
      doc.text("Restante", 400, tableTop, { width: colWidths.remaining });
      doc.text("Ventas Tot.", 470, tableTop, { width: colWidths.sales });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      let yPosition: number = tableTop + 25;

      doc.font("Helvetica").fontSize(9);
      stocks.forEach((stock: Stock) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.text(stock.product_name, 50, yPosition, {
          width: colWidths.product,
        });
        doc.text(`$${stock.spent_in.toFixed(2)}`, 200, yPosition, {
          width: colWidths.spent,
        });
        doc.text(`$${stock.sell_for.toFixed(2)}`, 270, yPosition, {
          width: colWidths.sell,
        });
        doc.text(stock.initial_stock.toString(), 340, yPosition, {
          width: colWidths.initial,
        });
        doc.text(stock.remaining_stock.toString(), 400, yPosition, {
          width: colWidths.remaining,
        });
        doc.text(`$${stock.total_sales.toFixed(2)}`, 470, yPosition, {
          width: colWidths.sales,
        });

        if (stock.description) {
          yPosition += 15;
          doc
            .fontSize(8)
            .fillColor("#666")
            .text(`Desc: ${stock.description}`, 50, yPosition, { width: 500 });
          doc.fillColor("#000");
        }

        yPosition += 25;
      });

      doc.moveDown(2);
      const totalSpent: number = stocks.reduce(
        (sum: number, s: Stock) => sum + s.spent_in,
        0
      );
      const totalSales: number = stocks.reduce(
        (sum: number, s: Stock) => sum + s.total_sales,
        0
      );

      doc.fontSize(12).font("Helvetica-Bold");
      doc.text(`Total Gastado en Stock: $${totalSpent.toFixed(2)}`);
      doc.text(`Total Ventas: $${totalSales.toFixed(2)}`);
      doc.text(`Ganancia Neta: $${(totalSales - totalSpent).toFixed(2)}`);
    } else {
      doc.fontSize(12).text("No hay inventario registrado para este evento.");
    }

    doc.end();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    throw new Error("Error al generar PDF: " + errorMessage);
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
