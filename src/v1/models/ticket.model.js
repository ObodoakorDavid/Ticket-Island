import mongoose from "mongoose";

const { Schema } = mongoose;

const ticketSchema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
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
    ticketPrice: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    qrCode: {
      type: String, // Store the QR code as a string (e.g., base64 encoded data or URL).
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    isDeleted: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"], // You can define any status you need
      default: "pending", // Set the default status to 'pending' when ticket is created
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
