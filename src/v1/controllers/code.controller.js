import asyncWrapper from "../../middlewares/asyncWrapper.js";
import codeService from "../services/code.service.js";

export const createCode = asyncWrapper(async (req, res) => {
  const codeData = req.body;
  const { userId, userProfileId } = req.user;
  const result = await codeService.createCode(codeData, userId, userProfileId);
  res.status(201).json(result);
});

export const getAllCodes = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await codeService.getAllCodes(query);
  res.status(200).json(result);
});

export const getCode = asyncWrapper(async (req, res) => {
  const { codeId } = req.params;
  const result = await codeService.getCode(codeId);
  res.status(200).json(result);
});

export const updateCode = asyncWrapper(async (req, res) => {
  const { codeId } = req.params;
  const codeData = req.body;
  const result = await codeService.updateCode(codeId, codeData);
  res.status(200).json(result);
});

export const deleteCode = asyncWrapper(async (req, res) => {
  const { codeId } = req.params;
  const result = await codeService.deleteCode(codeId);
  res.status(200).json(result);
});
