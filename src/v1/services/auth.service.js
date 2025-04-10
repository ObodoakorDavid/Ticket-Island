import mongoose from "mongoose";
import User from "../modules/user/user.model.js";
import { generateToken, verifyToken } from "../../config/token.js";
import OTP from "../models/otp.model.js";
import ApiError from "../../utils/apiError.js";
import { hashPassword, validatePassword } from "../../utils/validationUtils.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import MailingList from "../models/mailingList.model.js";
import emailUtils from "../../utils/emailUtils.js";

export async function findUserByEmail(email) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.notFound("No user with this email");
  }
  return user;
}

export async function findUserByIdOrEmail(identifier) {
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  const user = await User.findOne(
    isObjectId ? { _id: identifier } : { email: identifier }
  ).select("+password");

  if (!user) {
    throw ApiError.notFound("User Not Found");
  }

  return user;
}

export async function register(userData = {}) {
  const { email, password, joinMailingList } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.badRequest("User with this email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ ...userData, password: hashedPassword });

  // Add user to mailing list if requested
  await addUserToMailingList({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userId: user._id,
    joinMailingList,
  });

  const token = generateToken(
    {
      email: user.email,
      userId: user._id,
      roles: user.roles,
    },
    "1h"
  );

  const magicLink = `${process.env.SERVER_BASE_URL}/api/v1/auth/verify-email?token=${token}`;

  try {
    const emailInfo = await emailUtils.sendMagicLinkEmail(
      user.email,
      user.firstName,
      magicLink
    );

    return ApiSuccess.created(
      `Registration Successful, Email has been sent to ${emailInfo.envelope.to}`,
      { email: user.email, id: user._id }
    );
  } catch (error) {
    console.log("Error sending email", error);
    return ApiSuccess.created(`Registration Successful`, {
      email: user.email,
      id: user._id,
    });
  }
}

export async function login(userData = {}) {
  const { email, password } = userData;
  const user = await findUserByEmail(email);
  await validatePassword(password, user.password);

  if (!user.isVerified) {
    throw ApiError.forbidden("Email Not Verified");
  }

  const token = generateToken({
    userId: user._id,
    user: user._id,
    roles: user.roles,
  });

  return ApiSuccess.ok("Login Successful", {
    user: { email: user.email, id: user._id, roles: user.roles },
    token,
  });
}

export async function getUser(userId) {
  const user = await findUserByIdOrEmail(userId);
  user.password = undefined;
  return ApiSuccess.ok("User Retrieved Successfully", {
    user,
  });
}

export async function sendOTP({ email }) {
  const user = await findUserByIdOrEmail(email);
  if (user.isVerified) {
    return ApiSuccess.ok("User Already Verified");
  }

  const emailInfo = await emailUtils.sendOTPEmail(user.email, user.firstName);

  return ApiSuccess.ok(`OTP has been sent to ${emailInfo.envelope.to}`);
}

export async function verifyOTP({ email, otp }) {
  const user = await findUserByIdOrEmail(email);
  if (user.isVerified) {
    return ApiSuccess.ok("User Already Verified");
  }

  const otpExists = await OTP.findOne({ email, otp });
  if (!otpExists || otpExists.expiresAt < Date.now()) {
    throw ApiError.badRequest("Invalid or Expired OTP");
  }

  user.isVerified = true;
  await user.save();
  return ApiSuccess.ok("Email Verified");
}

export async function forgotPassword({ email }) {
  const user = await findUserByIdOrEmail(email);
  const emailInfo = await emailUtils.sendOTPEmail(user.email, user.firstName);
  return ApiSuccess.ok(`OTP has been sent to ${emailInfo.envelope.to}`);
}

export async function resetPassword({ email, otp, password }) {
  const user = await findUserByEmail(email);
  const otpExists = await OTP.findOne({ email, otp });
  if (!otpExists) {
    throw ApiError.badRequest("Invalid or Expired OTP");
  }

  user.password = await hashPassword(password);
  await user.save();
  return ApiSuccess.ok("Password Updated");
}

export const resendVerificationEmailService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.badRequest("No User with this email");
  }

  if (user.isVerified) {
    throw ApiError.badRequest("Email already verified");
  }

  const token = generateToken(
    {
      email: user.email,
      userId: user._id,
      roles: user.roles,
    },
    "1h"
  );

  const magicLink = `${process.env.SERVER_BASE_URL}/api/v1/auth/verify-email?token=${token}`;

  try {
    const emailInfo = await emailUtils.sendMagicLinkEmail(
      user.email,
      user.firstName,
      magicLink
    );

    return ApiSuccess.created(
      `Email has been sent to ${emailInfo.envelope.to}`,
      { email: user.email, id: user._id }
    );
  } catch (error) {
    console.log("Error sending email", error);
    return ApiError.internalServerError(`Failed to send email`);
  }
};

export const verifyEmailToken = async (token) => {
  if (!token) {
    throw ApiError.badRequest("Token is required");
  }
  const { userId } = verifyToken(token);

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (user.isVerified) {
    return ApiSuccess.ok("Email Already Verified");
  }

  user.isVerified = true;
  await user.save();

  return ApiSuccess.ok("Email Verified");
};

export async function addUserToMailingList(userData = {}) {
  const { email, firstName, lastName, userId, joinMailingList } = userData;

  if (joinMailingList) {
    const existingSubscription = await MailingList.findOne({ email });

    if (existingSubscription) {
      return ApiSuccess.ok("User is already subscribed to the mailing list");
    }

    await MailingList.create({
      userId,
      email,
      firstName,
      lastName,
    });

    return ApiSuccess.created("User has been added to the mailing list");
  }

  return ApiSuccess.ok("User opted not to join the mailing list");
}

export async function addOrganizerRole(userId) {
  const user = await findUserByIdOrEmail(userId);

  if (user.roles.includes("organizer")) {
    return ApiSuccess.ok("User is already an organizer", {
      user,
    });
  }

  user.roles.push("organizer");
  await user.save();

  return ApiSuccess.ok("User has been assigned as an organizer", {
    user,
  });
}

const authService = {
  findUserByEmail,
  findUserByIdOrEmail,
  register,
  login,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  verifyEmailToken,
  addUserToMailingList,
  addOrganizerRole,
  resendVerificationEmailService,
};

export default authService;
