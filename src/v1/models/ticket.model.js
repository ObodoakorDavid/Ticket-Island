import mongoose from "mongoose";

const { Schema } = mongoose;

const ticketSchema = new Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true, // The event this ticket belongs to
    },
    eventTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventTicket",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The user who purchased the ticket
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "UserProfile",
    //   required: true, // The user's profile details
    // },
    basePrice: {
      type: Number,
      required: true,
      min: [0, "Base price cannot be negative"], // Base price of a single ticket
    },
    netPrice: {
      type: Number,
      required: false, // Final price after applying discounts
      min: [0, "Net price cannot be negative"], // Base price of a single ticket
    },
    promoCode: {
      type: String,
      required: false, // Code applied for discount (if any)
    },
    isPromoApplied: {
      type: Boolean,
      required: false,
      default: false, // Indicates if a promo code was successfully applied
    },
    purchaseDate: {
      type: Date,
      default: Date.now, // Date and time of purchase
    },
    qrCode: {
      type: String,
      required: false, // QR code for ticket verification
    },
    hasBeenScanned: {
      type: Boolean,
      default: false, // Indicates if the ticket has been scanned/used
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete flag
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Add indexes to optimize queries
ticketSchema.index({ eventId: 1, userId: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
