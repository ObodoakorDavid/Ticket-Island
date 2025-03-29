import userService from "./user.service.js";
import asyncWrapper from "../../../middlewares/asyncWrapper.js";

//Users
export const updateUserRole = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const data = req.body;
  const result = await userService.addActivatorRole(userId, data);
  res.status(200).json(result);
});

export const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await userService.getAllUsers(query);
  res.status(200).json(result);
});

export const getSingleUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const result = await userService.getUser(userId);
  res.status(200).json(result);
});
