import { sendQRCodeEmail } from "./emailUtils.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import { generateTicketPDF } from "./generateOTP.js";
import Ticket from "../v1/models/ticket.model.js";

export const sendTicketsToEmail = async (transaction) => {
  const userEmail = transaction.user.email;
  const userFirstName = transaction.user.firstName;
  const eventName = transaction.eventId.title;
  const numberOfTickets = transaction.unit;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const pdfDir = path.join(__dirname, "../storage/");

  const ticketPaths = [];
  const createdTickets = [];

  for (let i = 0; i < numberOfTickets; i++) {
    // Step 1: Create the ticket in the database
    const newTicket = await Ticket.create({
      eventId: transaction.eventId._id,
      userId: transaction.user._id,
      user: transaction.user._id,
      basePrice: transaction.basePrice,
      discountCodeUsed: transaction.isPromoApplied,
      netPrice: transaction.netPrice / numberOfTickets,
    });

    if (transaction.isPromoApplied) {
      newTicket.promoCode = transaction.promoCode;
    }

    createdTickets.push(newTicket);

    // Step 2: Generate QR code using the ticket ID
    const qrCodeData = await QRCode.toDataURL(
      `${
        process.env.SERVER_BASE_URL
      }/api/v1/tickets/${newTicket._id.toString()}`
    );

    // Update the ticket with the generated QR code
    newTicket.qrCode = qrCodeData;
    await newTicket.save();

    // Step 3: Generate PDF for each ticket
    const pdfPath = path.join(pdfDir, `eTicket_${newTicket._id}.pdf`);
    await generateTicketPDF({ userFirstName, eventName, qrCodeData, pdfPath });

    ticketPaths.push(pdfPath);
  }

  // Attach tickets to the transaction
  transaction.tickets = createdTickets.map((ticket) => ticket._id);
  await transaction.save();

  // Send all tickets via email
  try {
    await sendQRCodeEmail(userEmail, userFirstName, ticketPaths, eventName);
  } catch {}

  // Step 4: Delete the PDFs from storage after sending the email
  try {
    for (const ticketPath of ticketPaths) {
      fs.unlink(ticketPath, (err) => {
        if (err) {
          console.error(`Error deleting file ${ticketPath}:`, err);
        } else {
          console.log(`Successfully deleted ${ticketPath}`);
        }
      });
    }
  } catch (error) {
    console.error("Error deleting files from storage:", error);
  }
};
