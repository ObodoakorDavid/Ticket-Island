import otpGenerator from "otp-generator";
import PDFDocument from "pdfkit";
import fs from "fs";

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
  eventName,
  qrCodeData,
  pdfPath,
}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    doc.fontSize(20).text("Event Ticket", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${userFirstName}`);
    doc.text(`Event: ${eventName}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
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
