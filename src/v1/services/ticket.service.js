import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import Ticket from "../models/ticket.model.js";

export async function createTicket(ticketData, userId, userProfileId) {
  const ticket = new Ticket({ ...ticketData, userId, user: userProfileId });
  await ticket.save();
  return ApiSuccess.ok("Ticket Created Successfully", { ticket });
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
};

export default ticketService;
