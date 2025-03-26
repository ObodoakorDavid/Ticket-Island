import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { sendTicketsToEmail } from "../../utils/general.js";
import { paginate } from "../../utils/paginate.js";
import Order from "../models/order.model.js";
import ticketService from "./ticket.service.js";

export async function getOrderById(orderId) {
  const order = await Order.findOne({
    _id: orderId,
  }).populate([
    {
      path: "user",
    },
    {
      path: "tickets",
    },
    {
      path: "event",
    },
    {
      path: "eventTicket",
    },
  ]);

  if (!order) throw ApiError.notFound("Order not found");
  return order;
}

export async function getAllOrders(userId, query) {
  const { page = 1, limit = 10, search } = query;

  const filterQuery = { user: userId };
  const populateOptions = [
    {
      path: "user",
      select: ["firstName", "lastName"],
    },
    {
      path: "event",
      select: ["title", "address"],
    },
    {
      path: "eventTicket",
      select: ["title", "address"],
    },
  ];

  const sort = { createdAt: -1 };

  if (search) {
    const searchQuery = {
      $or: [
        { reference: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ],
    };
    Object.assign(filterQuery, searchQuery);
  }

  const { documents: orders, pagination } = await paginate({
    model: Order,
    query: filterQuery,
    page,
    limit,
    sort,
    populateOptions,
    select: ["-qrcode"],
  });

  return ApiSuccess.ok("Orders Retrieved Successfully", {
    orders,
    pagination,
  });
}

export async function getOrganizerOrders(userId, query) {
  const { page = 1, limit = 10, search } = query;

  const filterQuery = { organizer: userId };
  const populateOptions = [
    {
      path: "user",
      select: ["firstName", "lastName"],
    },
    {
      path: "event",
      select: ["title", "address"],
    },
  ];

  const sort = { createdAt: -1 };

  if (search) {
    const searchQuery = {
      $or: [
        { reference: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ],
    };
    Object.assign(filterQuery, searchQuery);
  }

  const { documents: orders, pagination } = await paginate({
    model: Order,
    query: filterQuery,
    page,
    limit,
    sort,
    populateOptions,
    select: ["-qrcode"],
  });

  return ApiSuccess.ok("Orders Retrieved Successfully", {
    orders,
    pagination,
  });
}

// Retrieve a specific order by ID
export async function getOrder(orderId) {
  const order = await Order.findOne({
    _id: orderId,
  }).populate([
    { path: "tickets", select: ["-qrCode"] },
    { path: "user", select: ["firstName", "lastName"] },
    { path: "event", select: ["title", "address"] },
  ]);

  if (!order) throw ApiError.notFound("Order not found");
  return ApiSuccess.ok("Order Retrieved Successfully", { order });
}

export async function resendOrderTicketsToEmail(orderId) {
  const order = await getOrderById(orderId);

  const { ticketPaths } = await ticketService.generateExistingTickets(
    order._id
  );

  const emailSent = await sendTicketsToEmail({
    userEmail: order.user.email,
    userFirstName: order.user.firstName,
    ticketPaths,
    eventName: order.event.name,
  });

  if (!emailSent) {
    throw ApiError.internalServerError("Unable to send tickets to mail");
  }
  return ApiSuccess.ok("Tickets has been sent to your email");
}

const orderService = {
  getAllOrders,
  getOrganizerOrders,
  getOrderById,
  getOrder,
  resendOrderTicketsToEmail,
};

export default orderService;
