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
import { sendTicketsToEmail } from "../../utils/general.js";

export async function buyTicket(ticketData, userId, userProfileId) {
  //
  const { ticketId, eventId, unit, promoCode } = ticketData;

  const eventTicket = await eventService.getEventTicketById(ticketId);
  const event = await eventService.getEventById(eventId);

  if (unit > eventTicket.maximumQuantity) {
    throw ApiError.unprocessableEntity("Not enough tickets available");
  }

  if (unit < eventTicket.minimumQuantity) {
    throw ApiError.unprocessableEntity(
      `Minimun quantity to purchase is ${eventTicket.minimumQuantity}`
    );
  }

  const transaction = new Transaction({
    eventId: eventTicket.eventId,
    userId,
    user: userProfileId,
    basePrice: eventTicket.price * unit,
    netPrice: eventTicket.price * unit,
    paymentStatus: "pending",
    unit,
    commissionBornedBy: event.commissionBornedBy,
  });

  if (eventTicket.type == "free") {
    transaction.netPrice = 0;
    transaction.basePrice = 0;
    transaction.status = "success";

    await transaction.save();

    await sendTicketsToEmail(transaction);

    return ApiSuccess.ok(
      "Transaction Successful, Ticket has been to sent to your email",
      {
        transaction,
      }
    );
  }

  let priceToPay = eventTicket.price * unit;

  if (promoCode) {
    const { data } = await getCodeByName(promoCode);
    const code = data.code;
    transaction.isPromoApplied = true;
    transaction.promoCode = ticketData.promoCode;

    const totalAmount = eventTicket.price * unit;
    const totalDiscount = code.discount * unit;
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

  await sendTicketsToEmail(transaction);

  return ApiSuccess.ok(
    "Payment Successful, Ticket has been to sent to your email",
    transaction
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
