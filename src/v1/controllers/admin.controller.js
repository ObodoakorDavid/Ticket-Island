import asyncWrapper from "../../middlewares/asyncWrapper.js";
import adminService from "../services/admin.service.js";
import eventService from "../services/event.service.js";
import orderService from "../services/order.service.js";

export const updateEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const eventData = req.body;

  console.log("hhhhh");

  const result = await adminService.updateEvent(eventId, eventData);
  res.status(200).json(result);
});
