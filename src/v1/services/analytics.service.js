import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import Event from "../models/event.model.js";
import EventTicket from "../models/eventTicket.js";

// Get analytics for a specific event
export async function getAnalytics(eventId) {
  const event = await Event.findOne({
    _id: eventId,
    isDeleted: false,
  }).populate("tickets");

  if (!event) throw ApiError.notFound("Event not found");

  // Number of subscribers
  const totalSubscribers = event.subscribers.length;

  // Number of tickets sold (Assuming you have a sold count or similar in ticket)
  let totalTicketsSold = 0;
  let totalRevenue = 0;

  if (event.tickets && event.tickets.length > 0) {
    const tickets = await EventTicket.find({
      _id: { $in: event.tickets },
      isVisible: true,
    });

    tickets.forEach((ticket) => {
      totalTicketsSold += ticket.sold || 0; // assuming 'sold' field in ticket
      totalRevenue += (ticket.sold || 0) * (ticket.price || 0);
    });
  }

  return ApiSuccess.ok("Event Analytics Retrieved Successfully", {
    totalSubscribers,
    totalTicketsSold,
    totalRevenue,
  });
}

const analyticsService = {
  getAnalytics,
};

export default analyticsService;
