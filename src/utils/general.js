import fs from "fs";
import emailUtils from "./emailUtils.js";

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

    console.log("Email sent successfully");
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
