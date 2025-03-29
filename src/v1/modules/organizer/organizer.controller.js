import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import organizerService from "./organizer.service.js";

export const getOrganizerProfile = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const result = await organizerService.getOrganizerProfile(userId);
  res.status(200).json(result);
});

export const updateOrganizerProfile = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const organizerData = req.body;
  const logo = req.files?.logo ? req.files.logo : null;
  const result = await organizerService.updateOrganizerProfile(
    userId,
    organizerData,
    logo
  );
  res.status(200).json(result);
});
