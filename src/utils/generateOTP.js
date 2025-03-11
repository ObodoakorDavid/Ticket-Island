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

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    doc.fontSize(20).text("Event Ticket", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${userLastName} ${userFirstName}`);
    doc.text(`Event: ${eventName}`);
    doc.text(`Start Date: ${startDate}`);
    doc.text(`End Date: ${endDate}`);
    doc.text(`Ticket Type: ${ticketName}`);
    doc.moveDown();

    doc.text("Scan the QR code below for entry:", { align: "center" });
    doc.moveDown();

    // Embed QR Code
    doc.image(qrCodeData, {
      fit: [150, 150],
      align: "center",
      valign: "center",
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};
