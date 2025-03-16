import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide a firstName"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide a firstName"],
    },
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
    password: {
      type: String,
      required: [true, "Please provide a password"],
      select: false,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a phone number"],
      match: [
        /^(0)(7|8|9){1}(0|1){1}[0-9]{8}$/,
        "Please enter a valid Nigerian phone number",
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/demmgc49v/image/upload/v1695969739/default-avatar_scnpps.jpg",
    },
    roles: {
      type: [String],
      enum: ["user", "admin", "organizer"],
      default: ["user"],
    },
    balance: {
      type: Number,
      default: 0, // Default balance set to 0
      min: [0, "Balance cannot be less than 0"], // Optional: prevent negative balance
    },
    cashbackBalance: {
      type: Number,
      default: 0, // Default cashback balance is 0
      min: [0, "Cashback cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
