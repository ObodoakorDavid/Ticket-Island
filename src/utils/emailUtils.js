import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import OTP from "../v1/models/otp.model.js";
import generateOTP from "../utils/generateOTP.js";
import createTransporter from "../lib/emailTransporter.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultSender = "Admin@TicketIsland.com";
const transporter = createTransporter();

const compileTemplate = (fileName) => {
  const filePath = path.join(__dirname, "..", "templates", fileName);
  const templateSource = fs.readFileSync(filePath, "utf8");
  return handlebars.compile(templateSource);
};

// const OTPTemplate = compileTemplate(
//   path.join(__dirname, "..", "templates", "OTPEmail.html")
// );
// const MagicLinkTemplate = compileTemplate(
//   path.join(__dirname, "..", "templates", "MagicLinkEmail.html")
// );
// const QRCodeTemplate = compileTemplate(
//   path.join(__dirname, "..", "templates", "QRCode.html")
// );
// const PromotionalEmailTemplate = compileTemplate(
//   path.join(__dirname, "..", "templates", "QRCode.html")
// );

const templates = {
  OTPEmail: compileTemplate("OTPEmail.html"),
  MagicLinkEmail: compileTemplate("MagicLinkEmail.html"),
  QRCodeEmail: compileTemplate("QRCode.html"),
  PromotionalEmail: compileTemplate("PromotionalEmail.html"),
};

const sendEmail = async ({
  from = defaultSender,
  replyTo = defaultSender,
  to,
  subject,
  text,
  html,
  attachments = [],
}) => {
  const mailOptions = { from, to, subject, text, html, attachments, replyTo };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendOTPEmail = async (email, userName) => {
  await OTP.findOneAndDelete({ email });
  const otp = generateOTP();
  await OTP.create({ email, otp });

  const subject = "OTP Request";
  const date = new Date().getFullYear();
  const emailText = `Hello ${userName},\n\nYour OTP is: ${otp}`;
  const html = templates.OTPEmail({ userName, otp, date });

  return sendEmail({ to: email, subject, text: emailText, html });
};

const sendMagicLinkEmail = async (email, userName, magicLink) => {
  const subject = "Verify Your Email Address";
  const date = new Date().getFullYear();
  const emailText = `Hello ${userName},\n\nPlease use the following link to verify your email: ${magicLink}`;
  const html = templates.MagicLinkEmail({ userName, magicLink, date });

  return sendEmail({ to: email, subject, text: emailText, html });
};

const sendQRCodeEmail = async (email, userName, ticketPaths, eventName) => {
  const subject = "Your Event Ticket";
  const date = new Date().getFullYear();
  const emailText = `Hello ${userName},\n\nHere is your ticket for ${eventName}. Please use the attached QR code for entry.`;
  const html = templates.QRCodeEmail({ userName, eventName, date });

  const attachments = ticketPaths.map((ticketPath, index) => ({
    filename: `eTicket_${index + 1}.pdf`,
    path: ticketPath,
    contentType: "application/pdf",
  }));

  return sendEmail({
    to: email,
    subject,
    text: emailText,
    html,
    attachments: attachments,
  });
};

const sendPromotionalEmail = async ({
  to = [],
  from,
  replyTo,
  subject,
  body,
  eventName,
  headerImage,
  organizerName,
  logo,
  address,
  city,
  state,
  country,
  twitterLink,
  instagramLink,
  facebookLink,
  //userName,
}) => {
  const date = new Date().getFullYear();
  const emailText = body;
  const html = templates.PromotionalEmail({
    eventName,
    // userName,
    subject,
    body,
    date,
    headerImage,
    organizerName,
    logo,
    address,
    city,
    state,
    country,
    twitterLink,
    instagramLink,
    facebookLink,
  });

  return sendEmail({
    to,
    from,
    replyTo,
    subject,
    text: emailText,
    html,
  });
};

export default {
  sendEmail,
  sendOTPEmail,
  sendMagicLinkEmail,
  sendQRCodeEmail,
  sendPromotionalEmail,
};
