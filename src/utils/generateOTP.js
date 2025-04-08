import otpGenerator from "otp-generator";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateOTP = () => {
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  return otp;
};

export default generateOTP;

// export const generateTicketPDF = ({
//   userFirstName,
//   userLastName,
//   eventName,
//   qrCodeData,
//   startDate,
//   ticketName,
//   endDate,
//   pdfPath,
// }) => {

//   return new Promise((resolve, reject) => {
//     const dir = path.dirname(pdfPath);

//     // Ensure the directory exists
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     const doc = new PDFDocument();
//     const stream = fs.createWriteStream(pdfPath);

//     doc.pipe(stream);

//     doc.fontSize(20).text("Event Ticket", { align: "center" });
//     doc.moveDown();

//     doc.fontSize(14).text(`Name: ${userLastName} ${userFirstName}`);
//     doc.text(`Event: ${eventName}`);
//     doc.text(`Start Date: ${startDate}`);
//     doc.text(`End Date: ${endDate}`);
//     doc.text(`Ticket Type: ${ticketName}`);
//     doc.moveDown();

//     doc.text("Scan the QR code below for entry:", { align: "center" });
//     doc.moveDown();

//     // Embed QR Code
//     doc.image(qrCodeData, {
//       fit: [150, 150],
//       align: "center",
//       valign: "center",
//     });

//     doc.end();

//     stream.on("finish", resolve);
//     stream.on("error", reject);
//   });
// };

export const generateTicketPDF = ({
  userFirstName,
  userLastName,
  eventName,
  qrCodeData,
  startDate,
  ticketName,
  endDate,
  pdfPath,
}) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(pdfPath);

    // Ensure the directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const doc = new PDFDocument({
      size: [400, 600], // Custom ticket size (width x height)
      margin: 0,
      layout: "portrait",
    });

    const stream = fs.createWriteStream(pdfPath);
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
      .text(eventName.toUpperCase(), contentX, contentY);

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
      .text(`${userFirstName} ${userLastName}`, contentX, contentY + 15);

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

    drawDetail(
      "DATE",
      `${startDate} ${endDate ? `to ${endDate}` : ""}`,
      contentY
    );
    drawDetail("TICKET TYPE", ticketName, contentY + 50);

    // QR code area
    const qrSize = 120;
    const qrX = doc.page.width / 2 - qrSize / 2;
    const qrY = doc.page.height - 150;

    doc
      .roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 30, 8)
      .fill("#f3f4f6")
      .stroke("#e5e7eb");

    doc.image(qrCodeData, qrX, qrY, { width: qrSize });

    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text("SCAN FOR ENTRY", doc.page.width / 2 - 30, qrY + qrSize + 5, {
        width: 60,
        align: "center",
      });

    // Footer note
    doc
      .fontSize(8)
      .fillColor("#9ca3af")
      .text(
        "Present this ticket at entrance",
        20,
        doc.page.height - 30,
        {
          width: doc.page.width - 40,
          align: "center",
        }
      );

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};
