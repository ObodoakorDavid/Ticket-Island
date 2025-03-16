import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import Event from "../models/event.model.js";
import EventTicket from "../models/eventTicket.model.js";
import Ticket from "../models/ticket.model.js";

// Get analytics for a specific event
export async function getAnalytics(userId) {
  const ticketsSoldCount = await Ticket.countDocuments({ organizer: userId });
  const ticketsScannedCount = await Ticket.countDocuments({
    organizer: userId,
    hasBeenScanned: true,
  });

  const ticketsPublishedCount = await EventTicket.countDocuments({
    organizer: userId,
  });

  const eventsHostedCount = await Event.countDocuments({
    organizer: userId,
    status: "approved",
  });

  // ✅ Total revenue from tickets sold (sum of netPrice)
  const totalRevenueAggregation = await Ticket.aggregate([
    { $match: { organizer: userId } }, // Filter tickets for this organizer
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$netPrice" }, // Sum of netPrice field
      },
    },
  ]);

  const totalRevenue = totalRevenueAggregation[0]?.totalRevenue || 0;

  return ApiSuccess.ok("Analytics Retrieved Successfully", {
    ticketsSoldCount,
    ticketsScannedCount,
    ticketsPublishedCount,
    eventsHostedCount,
    totalRevenue,
  });
}

const analyticsService = {
  getAnalytics,
};

export default analyticsService;
