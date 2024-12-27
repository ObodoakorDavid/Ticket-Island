import asyncWrapper from "../../middlewares/asyncWrapper.js";
import waitlistService from "../services/waitlist.service.js";

// Controller to add a user to the waitlist
export const addToWaitlist = asyncWrapper(async (req, res) => {
  const waitlistData = req.body;
  const result = await waitlistService.addToWaitlist(waitlistData);
  res.status(201).json(result);
});

// Controller to get all users in the waitlist
export const getAllWaitlist = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await waitlistService.getAllWaitlist(query);
  res.status(200).json(result);
});
