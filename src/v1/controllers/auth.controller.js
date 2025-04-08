import asyncWrapper from "../../middlewares/asyncWrapper.js";
import {
  register as registerUser,
  login as loginUser,
  getUser as getUserProfile,
  sendOTP as sendUserOTP,
  verifyOTP as verifyUserOTP,
  forgotPassword as handleForgotPassword,
  resetPassword as handleResetPassword,
  verifyEmailToken as verifyEmailInService,
} from "../../v1/services/auth.service.js";

export const register = asyncWrapper(async (req, res) => {
  const userData = req.body;
  const result = await registerUser(userData);
  res.status(201).json(result);
});

export const login = asyncWrapper(async (req, res) => {
  const userData = req.body;
  const result = await loginUser(userData);
  res.status(200).json(result);
});

export const getUser = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const result = await getUserProfile(userId);
  res.status(200).json(result);
});

export const sendOTP = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  const result = await sendUserOTP({ email });
  res.status(200).json(result);
});

export const verifyOTP = asyncWrapper(async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyUserOTP({ email, otp });
  res.status(200).json(result);
});

export const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  const result = await handleForgotPassword({ email });
  res.status(200).json(result);
});

export const resetPassword = asyncWrapper(async (req, res) => {
  const { email, otp, password } = req.body;
  const result = await handleResetPassword({ email, otp, password });
  res.status(200).json(result);
});

export const verifyEmailToken = asyncWrapper(async (req, res) => {
  const { token } = req.query;
  const result = await verifyEmailInService(token);
  res.redirect(`${process.env.CLIENT_BASE_URL}/auth/login`);
  // res.status(200).json(result);
});
