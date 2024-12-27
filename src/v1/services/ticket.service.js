import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import { payWithPayStack, verifyPayStackPayment } from "../../utils/payment.js";
import Ticket from "../models/ticket.model.js";
import authService from "../../v1/services/auth.service.js";
import eventService from "../../v1/services/event.service.js";
import QRCode from "qrcode"; // You'll need a library to generate QR codes, like qrcode
import { sendQRCodeEmail } from "../../utils/emailUtils.js";
import { generateTicketPDF } from "../../utils/generateOTP.js";
import path from "path";
import { fileURLToPath } from "url";

export async function createTicket(ticketData, userId, userProfileId) {
  const { data } = await eventService.getEvent(ticketData.eventId);
  const event = data.event;

  const ticket = new Ticket({
    eventId: event._id,
    userId,
    user: userProfileId,
    ticketPrice: event.ticketPrice,
    paymentStatus: "pending",
  });

  const user = await authService.findUserProfileByIdOrEmail(userId);

  const { authorizationUrl } = await payWithPayStack(
    user.email,
    ticket.ticketPrice,
    ticket._id
  );

  await ticket.save();
  return ApiSuccess.ok("Ticket Created Successfully", {
    ticket,
    authorizationUrl,
  });
}

export async function handlePaymentSuccess(ticketId, transactionRef) {
  console.log({ ticketId, transactionRef });

  const ticket = await Ticket.findById(ticketId).populate("user eventId");
  if (!ticket) throw ApiError.notFound("Ticket not found");

  // const { data } = await verifyPayStackPayment(transactionRef);

  // console.log(data);

  // if (data?.status !== "success") {
  //   throw ApiError.badRequest("Transasction Reference Invalid");
  // }
  // Generate a QR code (could be base64 or a URL to the QR code image)
  const qrCodeData = await QRCode.toDataURL(
    `${process.env.SERVER_BASE_URL}/api/v1/tickets/${ticket._id.toString()}`
  );

  // console.log(qrCodeData);

  // Update the ticket with the payment status and the generated QR code
  ticket.paymentStatus = "paid";
  ticket.qrCode = qrCodeData;

  await ticket.save();

  const userEmail = ticket.user.email;
  const userFirstName = ticket.user.firstName;
  const eventName = ticket.eventId.title;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Generate PDF
  const pdfPath = path.join(__dirname, `../../storage/eTicket.pdf`);

  console.log(pdfPath);

  await generateTicketPDF({ userFirstName, eventName, qrCodeData, pdfPath });

  await sendQRCodeEmail(
    userEmail,
    userFirstName,
    qrCodeData,
    eventName,
    pdfPath
  );

  return ApiSuccess.ok(
    "Payment Successful, Ticket has been to sent to your email",
    { ticket }
  );
}

export async function getAllTickets(query) {
  const { page = 1, limit = 10, search, ...filters } = query;

  const filterQuery = { isDeleted: false };

  //   if (search) {
  //     const searchQuery = {
  //       $or: [
  //         { title: { $regex: search, $options: "i" } },
  //         { event: { $regex: search, $options: "i" } },
  //         { ticketType: { $regex: search, $options: "i" } },
  //       ],
  //     };
  //     Object.assign(filterQuery, searchQuery);
  //   }

  for (const key in filters) {
    if (filters[key]) {
      filterQuery[key] = filters[key];
    }
  }

  const { documents: tickets, pagination } = await paginate(
    Ticket,
    filterQuery,
    page,
    limit
  );

  return ApiSuccess.ok("Tickets Retrieved Successfully", {
    tickets,
    pagination,
  });
}

export async function getTicket(ticketId) {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });
  if (!ticket) throw ApiError.notFound("Ticket not found");
  return ApiSuccess.ok("Ticket Retrieved Successfully", {
    ticket,
  });
}

export async function updateTicket(ticketId, data) {
  const ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId, isDeleted: false },
    data,
    { new: true }
  );

  if (!ticket) throw ApiError.notFound("Ticket not found");

  return ApiSuccess.ok("Ticket Updated Successfully", {
    ticket,
  });
}

export async function deleteTicket(ticketId) {
  const ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!ticket) throw ApiError.notFound("Ticket not found");

  return ApiSuccess.ok("Ticket Deleted Successfully");
}

const ticketService = {
  createTicket,
  getAllTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  handlePaymentSuccess,
};

export default ticketService;
