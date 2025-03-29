import mongoose from "mongoose";

const { Schema } = mongoose;

const promotionalEmailSchema = new Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    headerImage: {
      type: String,
      required: true,
      trim: true,
    },
    from: {
      trim: true,
      type: String,
      required: true,
      trim: true,
    },
    replyTo: {
      trim: true,
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      trim: true,
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sentAt: {
      type: Date,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const PromotionalEmail = mongoose.model(
  "PromotionalEmail",
  promotionalEmailSchema
);

export default PromotionalEmail;
