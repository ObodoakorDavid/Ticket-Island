import mongoose from "mongoose";

const { Schema } = mongoose;

const waitlistSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        "Please provide a valid email",
      ],
      unique: [true, "User with this email already exists"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a phone number"],
      match: [
        /^(0)(7|8|9){1}(0|1){1}[0-9]{8}$/,
        "Please enter a valid Nigerian phone number",
      ],
    },
    university: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Waitlist", waitlistSchema);
