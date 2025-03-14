import asyncWrapper from "../../middlewares/asyncWrapper.js";
import analyticsService from "../services/analytics.service.js";

// Get analytics
export const getAnalytics = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const result = await analyticsService.getAnalytics(eventId);
  res.status(200).json(result);
});
