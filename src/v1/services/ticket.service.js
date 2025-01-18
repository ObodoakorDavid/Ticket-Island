import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import { payWithPayStack, verifyPayStackPayment } from "../../utils/payment.js";
import Ticket from "../models/ticket.model.js";
import authService from "../../v1/services/auth.service.js";
import eventService from "../../v1/services/event.service.js";
import QRCode from "qrcode";
import { sendQRCodeEmail } from "../../utils/emailUtils.js";
import { generateTicketPDF } from "../../utils/generateOTP.js";
import path from "path";
import { fileURLToPath } from "url";
import { getCodeByName } from "./code.service.js";
import Transaction from "../models/transaction.model.js";
import fs from "fs";
import { calculateCommission } from "../../utils/calculations.js";
import walletService from "./wallet.service.js";

export async function buyTicket(ticketData, userId, userProfileId) {
  const { data } = await eventService.getEvent(ticketData.eventId);
  const event = data.event;

  const transaction = new Transaction({
    eventId: event._id,
    userId,
    user: userProfileId,
    basePrice: event.ticketPrice * ticketData.unit,
    netPrice: event.ticketPrice * ticketData.unit,
    paymentStatus: "pending",
    unit: ticketData.unit,
    commissionBornedBy: event.commissionBornedBy,
  });

  let priceToPay = event.ticketPrice * ticketData.unit;

  if (ticketData?.promoCode) {
    const { data } = await getCodeByName(ticketData?.promoCode);
    const code = data.code;
    transaction.isPromoApplied = true;
    transaction.promoCode = ticketData.promoCode;

    const totalAmount = event.ticketPrice * ticketData.unit;
    const totalDiscount = code.discount * ticketData.unit;
    transaction.netPrice = totalAmount - totalDiscount;
    priceToPay = totalAmount - totalDiscount;
  }

  const commission = calculateCommission(priceToPay, event.pricingPlan);
  transaction.commissionAmount = commission;

  if (event.commissionBornedBy === "customer") {
    const newPriceToPay = priceToPay + commission;
    priceToPay = newPriceToPay;
    transaction.netPrice = newPriceToPay;
  }

  const user = await authService.findUserProfileByIdOrEmail(userId);

  const { authorizationUrl } = await payWithPayStack(
    user.email,
    priceToPay,
    transaction._id
  );

  await transaction.save();

  return ApiSuccess.ok("Transaction Initiated", {
    transaction,
    authorizationUrl,
  });
}

export async function handlePaymentSuccess(transactionId, transactionRef) {
  console.log({ transactionId, transactionRef });

  const existingTransaction = await Transaction.findOne({
    reference: transactionRef,
  });
  if (existingTransaction) {
    throw ApiError.badRequest("Transaction reference has already been used.");
  }

  const transaction = await Transaction.findById(transactionId).populate(
    "eventId user"
  );

  if (!transaction) throw ApiError.notFound("Transaction not found");

  const { data } = await verifyPayStackPayment(transactionRef);

  console.log(data?.status);

  if (data?.status !== "success") {
    throw ApiError.badRequest("Transasction Reference Invalid");
  }

  if (data?.amount / 100 !== transaction.netPrice) {
    throw ApiError.badRequest("Reference Mismatch");
  }

  // Update the transaction with the payment status
  transaction.status = "success";
  transaction.reference = transactionRef;
  await transaction.save();

  if (transaction.commissionBornedBy === "bearer") {
    const oraganizerCut = transaction.netPrice - transaction.commissionAmount;
    await walletService.creditWallet(transaction.eventId.user, oraganizerCut);
  }

  const userEmail = transaction.user.email;
  const userFirstName = transaction.user.firstName;
  const eventName = transaction.eventId.title;
  const numberOfTickets = transaction.unit;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const pdfDir = path.join(__dirname, "../../storage/");

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
  await sendQRCodeEmail(userEmail, userFirstName, ticketPaths, eventName);

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

  return ApiSuccess.ok(
    "Payment Successful, Ticket has been to sent to your email",
    data
  );
}

export async function getAllTickets(query) {
  const { page = 1, limit = 10, search, ...filters } = query;

  const filterQuery = { isDeleted: false };

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { event: { $regex: search, $options: "i" } },
        { ticketType: { $regex: search, $options: "i" } },
      ],
    };
    Object.assign(filterQuery, searchQuery);
  }

  for (const key in filters) {
    if (filters[key]) {
      filterQuery[key] = filters[key];
    }
  }

  const { documents: tickets, pagination } = await paginate({
    model: Ticket,
    query: filterQuery,
    page,
    limit,
  });

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

export async function updateTicket(ticketId, data, userId) {
  const ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId, userId, isDeleted: false },
    data,
    { new: true }
  );

  if (!ticket) throw ApiError.notFound("Ticket not found");

  return ApiSuccess.ok("Ticket Updated Successfully", {
    ticket,
  });
}

export async function deleteTicket(ticketId, userId) {
  const ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId, userId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!ticket) throw ApiError.notFound("Ticket not found");

  return ApiSuccess.ok("Ticket Deleted Successfully");
}

const ticketService = {
  buyTicket,
  getAllTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  handlePaymentSuccess,
};

export default ticketService;
