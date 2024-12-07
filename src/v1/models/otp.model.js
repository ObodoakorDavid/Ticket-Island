import mongoose from "mongoose";
const { Schema } = mongoose;

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60,
  },
});

export default mongoose.model("OTP", otpSchema);
