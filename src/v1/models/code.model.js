import mongoose from "mongoose";

const { Schema } = mongoose;

const codeSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    codeName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    codeType: {
      type: String,
      enum: ["promo", "access"],
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    limit: {
      type: Number,
      required: true,
      min: 1,
    },
    used: {
      type: Number,
      default: 0,
      min: 0,
    },
    codeStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Code", codeSchema);