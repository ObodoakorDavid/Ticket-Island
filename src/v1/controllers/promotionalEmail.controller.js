import asyncWrapper from "../../middlewares/asyncWrapper.js";
import promotionalEmailService from "../services/promotionalEmail.service.js";

export const sendPromotionalEmail = asyncWrapper(async (req, res) => {
  const emailData = req.body;
  const { userId } = req.user;
  const result = await promotionalEmailService.sendPromotionalEmail(
    emailData,
    userId
  );
  res.status(201).json(result);
});

export const getUserPromotionalEmails = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const query = req.query;
  const result = await promotionalEmailService.getUserPromotionalEmails(
    userId,
    query
  );
  res.status(200).json(result);
});

export const getPromotionalEmailById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const result = await promotionalEmailService.getPromotionalEmailById(id);
  res.status(200).json(result);
});

export const deletePromotionalEmail = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const result = await promotionalEmailService.deletePromotionalEmail(
    id,
    userId
  );
  res.status(200).json(result);
});
