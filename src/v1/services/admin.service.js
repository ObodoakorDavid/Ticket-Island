import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import Event from "../models/event.model.js";

export async function updateEvent(eventId, eventData = {}) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, isDeleted: false },
    eventData,
    { new: true }
  );

  console.log("hhhhh");

  if (!event) throw ApiError.notFound("Event not found");

  return ApiSuccess.ok("Event Updated Successfully", {
    event,
  });
}

export default {
  updateEvent,
};
