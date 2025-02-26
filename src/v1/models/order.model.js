import mongoose from "mongoose";

const { Schema } = mongoose;

// Order Schema for Bought Tickets
const OrderSchema = new Schema(
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
    unit: {
      type: Number,
      required: true,
      min: [1, "Units cannot be less than 1"],
      default: 1,
    },
    basePrice: {
      type: Number,
      required: true,
      min: [0, "Base price cannot be negative"],
    },
    netPrice: {
      type: Number,
      required: true,
      min: [0, "Net price cannot be negative"],
    },
    promoCode: {
      type: String,
      required: false,
      default: "",
    },
    isPromoApplied: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: [0, "Net price cannot be negative"],
      default: 0,
    },
    commissionBornedBy: {
      type: String,
      enum: ["bearer", "customer"],
      required: true,
    },
    reference: {
      type: String,
      required: false,
      default: "",
    },
    receivePromoEmails: {
      type: Boolean,
      required: false,
      default: false,
    },
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes to optimize queries
OrderSchema.index({ eventId: 1, userId: 1 });

const Order = mongoose.model("Order", OrderSchema);

export default Order;
