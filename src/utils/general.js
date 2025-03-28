import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import { generateTicketPDF } from "./generateOTP.js";
import Ticket from "../v1/models/ticket.model.js";
import emailUtils from "./emailUtils.js";
import { formatDate } from "../lib/utils.js";
import orderService from "../v1/services/order.service.js";
import { generateNewTickets } from "../v1/services/ticket.service.js";

export const sendTicketsToEmail = async ({
  userEmail,
  userFirstName,
  ticketPaths,
  eventName,
}) => {
  let emailSent = false;
  // Send all tickets via email
  try {
    await emailUtils.sendQRCodeEmail(
      userEmail,
      userFirstName,
      ticketPaths,
      eventName
    );

    emailSent = true;
  } catch (error) {
    console.log("Error sending the QRCode to email", error);
    emailSent = false;
  }

  deleteTicketsFromStorage(ticketPaths);

  return emailSent;
};

export const deleteTicketsFromStorage = async (ticketPaths = []) => {
  // Step 4: Delete the PDFs from storage after sending the email

  console.log({ ticketPaths });

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
