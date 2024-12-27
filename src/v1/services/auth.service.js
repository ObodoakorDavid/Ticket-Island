import mongoose from "mongoose";
import { generateToken, verifyToken } from "../../config/token.js";
import User from "../models/user.model.js";
import UserProfile from "../models/userProfile.model.js";
import OTP from "../models/otp.model.js";
import ApiError from "../../utils/apiError.js";
import { hashPassword, validatePassword } from "../../utils/validationUtils.js";
import { sendMagicLinkEmail, sendOTPEmail } from "../../utils/emailUtils.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import MailingList from "../models/mailingList.model.js";

export async function findUserByEmail(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.notFound("No user with this email");
  }
  return user;
}

export async function findUserProfileByIdOrEmail(identifier) {
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  const userProfile = await UserProfile.findOne(
    isObjectId ? { userId: identifier } : { email: identifier }
  );

  if (!userProfile) {
    throw ApiError.notFound("User Not Found");
  }

  return userProfile;
}

export async function register(userData = {}) {
  const { password, joinMailingList } = userData;
  const hashedPassword = await hashPassword(password);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create(
      [{ ...userData, password: hashedPassword }],
      { session }
    );
    const userProfile = await UserProfile.create(
      [
        {
          userId: user[0]._id,
          ...userData,
        },
      ],
      { session }
    );

    // Add user to mailing list if requested
    await addUserToMailingList({
      email: user[0].email,
      firstName: userProfile[0].firstName,
      lastName: userProfile[0].lastName,
      userId: user[0]._id,
      joinMailingList,
    });

    const token = generateToken(
      {
        email: user[0].email,
        userId: user[0]._id,
      },
      "1h"
    );

    const magicLink = `${process.env.CLIENT_BASE_URL}/api/v1/auth/verify-email?token=${token}`;

    const emailInfo = await sendMagicLinkEmail(
      user[0].email,
      userProfile[0].firstName,
      magicLink
    );

    await session.commitTransaction();
    return ApiSuccess.created(
      `Registration Successful, Email has been sent to ${emailInfo.envelope.to}`,
      { email: user[0].email, id: user[0]._id }
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function login(userData = {}) {
  const { email, password } = userData;
  const user = await findUserByEmail(email);
  await validatePassword(password, user.password);

  const userProfile = await findUserProfileByIdOrEmail(user._id);
  if (!userProfile.isVerified) {
    throw ApiError.forbidden("Email Not Verified");
  }

  const token = generateToken({
    userId: user._id,
    userProfileId: userProfile._id,
  });
  return ApiSuccess.ok("Login Successful", {
    user: { email: user.email, id: user._id },
    token,
  });
}

export async function getUser(userId) {
  const userProfile = await findUserProfileByIdOrEmail(userId);
  return ApiSuccess.ok("User Retrieved Successfully", {
    user: userProfile,
  });
}

export async function sendOTP({ email }) {
  const userProfile = await findUserProfileByIdOrEmail(email);
  if (userProfile.isVerified) {
    return ApiSuccess.ok("User Already Verified");
  }

  const emailInfo = await sendOTPEmail(
    userProfile.email,
    userProfile.firstName
  );

  return ApiSuccess.ok(`OTP has been sent to ${emailInfo.envelope.to}`);
}

export async function verifyOTP({ email, otp }) {
  const userProfile = await findUserProfileByIdOrEmail(email);
  if (userProfile.isVerified) {
    return ApiSuccess.ok("User Already Verified");
  }

  const otpExists = await OTP.findOne({ email, otp });
  if (!otpExists || otpExists.expiresAt < Date.now()) {
    throw ApiError.badRequest("Invalid or Expired OTP");
  }

  userProfile.isVerified = true;
  await userProfile.save();
  return ApiSuccess.ok("Email Verified");
}

export async function forgotPassword({ email }) {
  const userProfile = await findUserProfileByIdOrEmail(email);
  const emailInfo = await sendOTPEmail(
    userProfile.email,
    userProfile.firstName
  );
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

export const verifyEmailToken = async (token) => {
  if (!token) {
    throw ApiError.badRequest("Token is required");
  }

  const { userId } = verifyToken(token);

  console.log(userId);

  const userProfile = await UserProfile.findOne({ userId });
  if (!userProfile) {
    throw ApiError.notFound("User not found");
  }

  if (userProfile.isVerified) {
    return ApiSuccess.ok("Email Already Verified");
  }

  userProfile.isVerified = true;
  await userProfile.save();

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

const authService = {
  findUserByEmail,
  findUserProfileByIdOrEmail,
  register,
  login,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  verifyEmailToken,
  addUserToMailingList,
};

export default authService;
