import bcrypt from "bcrypt";
import mongoose from "mongoose";
import ApiError from "./apiError.js";

// Hash password
async function hashPassword(password) {
  if (!password) {
    throw ApiError.badRequest("Please provide a password");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

// Compares password
async function validatePassword(incomingPassword, existingPassword) {
  if (!incomingPassword || !existingPassword) {
    throw ApiError.badRequest("Please provide a password");
  }
  const isMatch = await bcrypt.compare(incomingPassword, existingPassword);
  if (!isMatch) {
    throw ApiError.unauthorized("Unauthorized");
  }
}

function isValidMongoId(id) {
  return mongoose.isValidObjectId(id);
}

export { hashPassword, validatePassword, isValidMongoId };
