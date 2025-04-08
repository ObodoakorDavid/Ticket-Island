import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export const generateTicketPDF = async () => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      process.cwd(),
      "./src/scripts/event-ticket.pdf"
    );

    const doc = new PDFDocument({
      size: [400, 600], // Custom ticket size (width x height)
      margin: 0,
      layout: "portrait",
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Blue header with white text
    doc.rect(0, 0, doc.page.width, 80).fill("#3b82f6");

    doc
      .fontSize(24)
      .fillColor("white")
      .font("Helvetica-Bold")
      .text("EVENT TICKET", 0, 30, {
        width: doc.page.width,
        align: "center",
      });

    // White content area with shadow effect
    doc
      .roundedRect(20, 100, doc.page.width - 40, doc.page.height - 180, 8)
      .fill("white")
      .stroke("#e5e7eb");

    // Event details
    const contentX = 40;
    let contentY = 130;

    // Event name
    doc
      .fontSize(18)
      .fillColor("#3b82f6")
      .font("Helvetica-Bold")
      .text("FRANCE MUSIC FESTIVAL", contentX, contentY);

    contentY += 30;

    // Divider line
    doc
      .moveTo(contentX, contentY)
      .lineTo(doc.page.width - 40, contentY)
      .stroke("#3b82f6", 1);

    contentY += 20;

    // Attendee info
    doc
      .fontSize(12)
      .fillColor("#6b7280")
      .font("Helvetica")
      .text("ATTENDEE", contentX, contentY);

    doc
      .fontSize(14)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text("David Obodoakor", contentX, contentY + 15);

    contentY += 50;

    // Event details grid
    const drawDetail = (label, value, y) => {
      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .font("Helvetica")
        .text(label, contentX, y);

      doc
        .fontSize(12)
        .fillColor("#111827")
        .font("Helvetica-Bold")
        .text(value, contentX, y + 15);
    };

    drawDetail("DATE", "November 15, 2023", contentY);
    drawDetail("TIME", "6:00 PM - 11:00 PM", contentY + 50);
    drawDetail("LOCATION", "Paris Expo, Porte de Versailles", contentY + 100);
    drawDetail("TICKET TYPE", "VIP ACCESS", contentY + 150);

    // QR code placeholder area
    doc
      .roundedRect(doc.page.width / 2 - 60, doc.page.height - 120, 120, 120, 8)
      .fill("#f3f4f6")
      .stroke("#e5e7eb");

    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text("SCAN FOR ENTRY", doc.page.width / 2 - 30, doc.page.height - 90, {
        width: 60,
        align: "center",
      });

    // Footer note
    doc
      .fontSize(8)
      .fillColor("#9ca3af")
      .text(
        "Present this ticket at entrance • No refunds • Subject to terms",
        20,
        doc.page.height - 30,
        {
          width: doc.page.width - 40,
          align: "center",
        }
      );

    doc.end();

    stream.on("finish", () => {
      console.log(`Ticket successfully created at ${outputPath}`);
      resolve();
    });
    stream.on("error", reject);
  });
};

generateTicketPDF()
  .then(() => console.log("Ticket generated successfully!"))
  .catch((err) => console.error("Error generating ticket:", err));
