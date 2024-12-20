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
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
