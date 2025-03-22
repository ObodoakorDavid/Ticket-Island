import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import { payWithPayStack, verifyPayStackPayment } from "../../utils/payment.js";
import Ticket from "../models/ticket.model.js";
import authService from "../../v1/services/auth.service.js";
import eventService from "../../v1/services/event.service.js";
import {
  getAndIncrementPromoCodeUsage,
  getCodeByName,
} from "./code.service.js";
import { calculateCommission } from "../../utils/calculations.js";
import walletService from "./wallet.service.js";
import { sendTicketsToEmail } from "../../utils/general.js";
import Order from "../models/order.model.js";
import orderService from "./order.service.js";
import QRCode from "qrcode";
import { generateTicketPDF } from "../../utils/generateOTP.js";

//
import path from "path";
import { fileURLToPath } from "url";
import { formatDate } from "../../lib/utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfDir = path.join(__dirname, "../../storage/");

export async function buyTicket(ticketData, userId) {
  const {
    ticketId,
    eventId,
    unit,
    promoCode,
    receivePromoEmails,
    useCashbackBalance,
  } = ticketData;

  const event = await eventService.getEventById(eventId);
  const eventTicket = await eventService.getEventTicketById(ticketId);
  const user = await authService.findUserByIdOrEmail(userId);

  eventService.isTicketForEvent(eventId, ticketId);

  if (unit > eventTicket.maximumQuantity) {
    throw ApiError.unprocessableEntity(
      `You can't purchase more than ${maximumQuantity} tickets`
    );
  }

  if (unit < eventTicket.minimumQuantity) {
    throw ApiError.unprocessableEntity(
      `Minimun quantity to purchase is ${eventTicket.minimumQuantity}`
    );
  }

  const order = new Order({
    event: eventTicket.eventId,
    user: userId,
    basePrice: eventTicket.price * unit,
    netPrice: eventTicket.price * unit,
    paymentStatus: "pending",
    unit,
    commissionBornedBy: event.commissionBornedBy,
    receivePromoEmails,
    eventTicket: ticketId,
    organizer: event.organizer._id,
  });

  if (eventTicket.type == "free") {
    order.netPrice = 0;
    order.basePrice = 0;
    order.status = "success";

    await order.save();

    const { ticketPaths } = await generateNewTickets(order._id);

    const emailSent = await sendTicketsToEmail({
      userEmail: order.user.email,
      userFirstName: order.user.firstName,
      ticketPaths,
      eventName: order.event.name,
    });

    const responseMessage = emailSent
      ? "Transaction Successful, Ticket has been to sent to your email"
      : "Transaction Successful";

    return ApiSuccess.ok(responseMessage, {
      order,
    });
  }

  let priceToPay = eventTicket.price * unit;

  if (promoCode) {
    const code = await getCodeByName(promoCode, eventTicket._id);

    order.isPromoApplied = true;
    order.promoCode = ticketData.promoCode;

    const totalAmount = eventTicket.price * unit;
    const totalDiscount = code.discount * unit;
    const amountAfterDiscount = totalAmount - totalDiscount;
    order.netPrice = amountAfterDiscount;
    priceToPay = amountAfterDiscount;
  }

  const shouldUseCashBalance = priceToPay > 0;

  if (useCashbackBalance && shouldUseCashBalance) {
    // const user = await authService.findUserByIdOrEmail(userId);
    const newPriceToPay = priceToPay - user.cashbackBalance;
    order.cashBackUsed = true;
    order.cashBackAmount = user.cashbackBalance;
    priceToPay = newPriceToPay;
  }

  if (priceToPay <= 0) {
    order.netPrice = 0;
    order.basePrice = 0;
    order.status = "success";

    await order.save();

    if (order.promoCode) {
      await getAndIncrementPromoCodeUsage(order.promoCode);
    }

    const { ticketPaths } = await generateNewTickets(order._id);

    const emailSent = await sendTicketsToEmail({
      userEmail: order.user.email,
      userFirstName: order.user.firstName,
      ticketPaths,
      eventName: order.event.name,
    });

    const responseMessage = emailSent
      ? "Transaction Successful, Ticket has been to sent to your email"
      : "Transaction Successful";

    return ApiSuccess.ok(responseMessage, {
      order,
    });
  }

  const commission = calculateCommission(priceToPay, event.pricingPlan);
  order.commissionAmount = commission;

  if (event.commissionBornedBy === "customer") {
    const newPriceToPay = priceToPay + commission;
    priceToPay = newPriceToPay;
    order.netPrice = newPriceToPay;
  }

  // const user = await authService.findUserByIdOrEmail(userId);

  const { authorizationUrl } = await payWithPayStack(
    user.email,
    priceToPay,
    order._id
  );

  await order.save();

  return ApiSuccess.ok("Order Initiated", {
    order,
    authorizationUrl,
  });
}

export async function handlePaymentSuccess(transactionId, transactionRef) {
  const existingTransaction = await Order.findOne({
    reference: transactionRef,
  });

  if (existingTransaction) {
    throw ApiError.badRequest("Transaction reference has already been used.");
  }

  const order = await Order.findById(transactionId).populate("event user");

  if (!order) throw ApiError.notFound("Transaction not found");

  const { data } = await verifyPayStackPayment(transactionRef);

  if (data?.status !== "success") {
    throw ApiError.badRequest("Transasction Reference Invalid");
  }

  if (data?.amount / 100 !== order.netPrice) {
    throw ApiError.badRequest("Reference amount Mismatch");
  }

  const user = await authService.findUserByIdOrEmail(order.user._id);

  if (order.cashBackUsed) {
    user.cashbackBalance = user.cashbackBalance - order.cashBackAmount;
  }

  // Update the transaction with the payment status
  order.status = "success";
  order.reference = transactionRef;
  await order.save();

  // Give cashback
  const cashbackAmount = order.netPrice * 0.001;
  user.cashbackBalance = cashbackAmount;

  // Increment Promo code usage
  await getAndIncrementPromoCodeUsage(order.promoCode);

  // Deduct a specific quantity from an event ticket and increment times bought
  await eventService.deductTicketQuantity(
    order.event._id,
    order.eventTicket._id,
    order.unit
  );

  if (order.commissionBornedBy === "bearer") {
    const oraganizerCut = order.netPrice - order.commissionAmount;
    await walletService.creditWallet(order.organizer._id, oraganizerCut);
  }

  if (order.receivePromoEmails) {
    await eventService.addSubscriberToEvent(order.event._id, order.user._id);
  }

  const { ticketPaths } = await generateNewTickets(order._id);

  await sendTicketsToEmail({
    userEmail: order.user.email,
    userFirstName: order.user.firstName,
    ticketPaths,
    eventName: order.event.name,
  });

  return order;
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
    sort: { createdAt: -1 },
    select: ["-qrCode"],
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

  return ApiSuccess.ok("Ticket updated successfully", {
    ticket,
  });
}

export async function scanTicket(ticketId) {
  const ticket = await Ticket.findById(ticketId);

  if (ticket.hasBeenScanned) {
    throw ApiError.badRequest("This ticket has been scanned");
  }

  ticket.hasBeenScanned = true;
  await ticket.save();

  return ApiSuccess.ok("Ticket scanned successfully", {
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

// Utility methods
export async function generateNewTickets(orderId) {
  const order = await orderService.getOrderById(orderId);

  // const userEmail = order.user.email;
  const userFirstName = order.user.firstName;
  const userLastName = order.user.lastName;
  const eventName = order.event.title;
  const numberOfTickets = order.unit;
  const startDate = formatDate(order.event.startTime);
  const endDate = formatDate(order.event.endTime);
  const ticketName = order.eventTicket.name;

  const ticketPaths = [];
  const createdTickets = [];

  for (let i = 0; i < numberOfTickets; i++) {
    const newTicket = await Ticket.create({
      event: order.event._id,
      user: order.user._id,
      basePrice: order.basePrice,
      discountCodeUsed: order.isPromoApplied,
      netPrice: order.netPrice / numberOfTickets,
      organizer: order.organizer._id,
    });

    if (order.isPromoApplied) {
      newTicket.promoCode = order.promoCode;
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
    await generateTicketPDF({
      userFirstName,
      userLastName,
      eventName,
      qrCodeData,
      startDate,
      endDate,
      ticketName,
      pdfPath,
    });

    ticketPaths.push(pdfPath);
  }

  order.tickets = createdTickets.map((ticket) => ticket._id);
  await order.save();
  return { ticketPaths, createdTickets };
}

export async function generateExistingTickets(orderId) {
  // const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // const pdfDir = path.join(__dirname, "../storage/");

  const order = await orderService.getOrderById(orderId);

  const ticketPaths = [];
  const createdTickets = [];

  // const userEmail = order.user.email;
  const userFirstName = order.user.firstName;
  const userLastName = order.user.lastName;
  const eventName = order.event.title;
  // const numberOfTickets = order.unit;
  const startDate = formatDate(order.event.startTime);
  const endDate = formatDate(order.event.endTime);
  const ticketName = order.eventTicket.name;

  for (const ticket of order.tickets) {
    const pdfPath = path.join(pdfDir, `eTicket_${ticket._id}.pdf`);
    await generateTicketPDF({
      userFirstName,
      userLastName,
      eventName,
      qrCodeData: ticket.qrCode,
      startDate,
      ticketName,
      endDate,
      pdfPath,
    });

    ticketPaths.push(pdfPath);
    createdTickets.push(ticket);
  }

  return { ticketPaths, createdTickets };
}

const ticketService = {
  buyTicket,
  getAllTickets,
  getTicket,
  updateTicket,
  scanTicket,
  deleteTicket,
  handlePaymentSuccess,
  generateNewTickets,
  generateExistingTickets,
};

export default ticketService;
