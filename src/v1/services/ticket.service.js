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

export async function buyTicket(ticketData, userId) {
  const { ticketId, eventId, unit, promoCode, receivePromoEmails } = ticketData;

  const event = await eventService.getEventById(eventId);
  const eventTicket = await eventService.getEventTicketById(ticketId);
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
  });

  if (eventTicket.type == "free") {
    order.netPrice = 0;
    order.basePrice = 0;
    order.status = "success";

    await order.save();

    await sendTicketsToEmail(order);

    return ApiSuccess.ok(
      "Transaction Successful, Ticket has been to sent to your email",
      {
        order,
      }
    );
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

  if (priceToPay <= 0 || eventTicket.type == "free") {
    order.netPrice = 0;
    order.basePrice = 0;
    order.status = "success";

    await order.save();

    if (order.promoCode) {
      await getAndIncrementPromoCodeUsage(order.promoCode);
    }

    await sendTicketsToEmail(order);

    return ApiSuccess.ok(
      "Transaction Successful, Ticket has been to sent to your email",
      {
        order,
      }
    );
  }

  const commission = calculateCommission(priceToPay, event.pricingPlan);
  order.commissionAmount = commission;

  if (event.commissionBornedBy === "customer") {
    const newPriceToPay = priceToPay + commission;
    priceToPay = newPriceToPay;
    order.netPrice = newPriceToPay;
  }

  const user = await authService.findUserByIdOrEmail(userId);

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
    throw ApiError.badRequest("Reference Mismatch");
  }

  // Update the transaction with the payment status
  order.status = "success";
  order.reference = transactionRef;
  await order.save();
  await getAndIncrementPromoCodeUsage(order.promoCode);

  if (order.commissionBornedBy === "bearer") {
    const oraganizerCut = order.netPrice - order.commissionAmount;
    await walletService.creditWallet(order.user._id, oraganizerCut);
  }

  if (order.receivePromoEmails) {
    await eventService.addSubscriberToEvent(order.event._id, order.user._id);
  }

  await sendTicketsToEmail(order);

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
