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

const defaultSender = "Admin@BCT.com";
const transporter = createTransporter();

const compileTemplate = (filePath) => {
  const templateSource = fs.readFileSync(filePath, "utf8");
  return handlebars.compile(templateSource);
};

const OTPTemplate = compileTemplate(
  path.join(__dirname, "..", "templates", "OTPEmail.html")
);
const MagicLinkTemplate = compileTemplate(
  path.join(__dirname, "..", "templates", "MagicLinkEmail.html")
);
const QRCodeTemplate = compileTemplate(
  path.join(__dirname, "..", "templates", "QRCode.html")
);

const sendEmail = async ({ to, subject, text, html, from = defaultSender }) => {
  const mailOptions = { from, to, subject, text, html };
  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent:", info.response);
  return info;
};

const sendOTPEmail = async (email, userName) => {
  await OTP.findOneAndDelete({ email });
  const otp = generateOTP();
  await OTP.create({ email, otp });

  const subject = "OTP Request";
  const date = new Date().getFullYear();
  const emailText = `Hello ${userName},\n\nYour OTP is: ${otp}`;
  const html = OTPTemplate({ userName, otp, date });

  return sendEmail({ to: email, subject, text: emailText, html });
};

const sendMagicLinkEmail = async (email, userName, magicLink) => {
  const subject = "Verify Your Email Address";
  const date = new Date().getFullYear();
  const emailText = `Hello ${userName},\n\nPlease use the following link to verify your email: ${magicLink}`;
  const html = MagicLinkTemplate({ userName, magicLink, date });

  return sendEmail({ to: email, subject, text: emailText, html });
};

const sendQRCodeEmail = async (
  email,
  userName,
  qrCodeUrl,
  eventName,
  pdfPath
) => {
  const subject = "Your Event Ticket";
  const date = new Date().getFullYear();
  const emailText = `Hello ${userName},\n\nHere is your ticket for ${eventName}. Please use the attached QR code for entry.`;
  const html = QRCodeTemplate({ userName, qrCodeUrl, eventName, date });

  return sendEmail({
    to: email,
    subject,
    text: emailText,
    html,
    attachments: [
      {
        filename: `ticket-${eventName}.pdf`,
        path: pdfPath,
      },
    ],
  });
};

export { sendEmail, sendOTPEmail, sendMagicLinkEmail, sendQRCodeEmail };
