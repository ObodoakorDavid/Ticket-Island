import mongoose from "mongoose";

const { Schema } = mongoose;

const eventTicketSchema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["free", "paid"],
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide a ticket name"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a ticket price"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Please provide the ticket quantity"],
      min: [0, "Quantity cannot be negative"],
    },
    minimumQuantity: {
      type: Number,
      default: 1,
      min: [1, "Minimum quantity must be at least 1"],
    },
    maximumQuantity: {
      type: Number,
      required: [true, "Please provide the maximum quantity"],
      validate: [
        {
          validator: function (value) {
            return value >= this.minimumQuantity;
          },
          message:
            "Maximum quantity must be greater than or equal to minimum quantity",
        },
        {
          validator: function (value) {
            return value <= this.quantity;
          },
          message: "Maximum quantity must not exceed quantity",
        },
      ],
    },
    salesStart: {
      type: Date,
      required: [true, "Please provide the sales start date"],
    },
    salesEnd: {
      type: Date,
      required: [true, "Please provide the sales end date"],
      validate: {
        validator: function (value) {
          return value > this.salesStart;
        },
        message: "Sales end date must be after sales start date",
      },
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const EventTicket = mongoose.model("EventTicket", eventTicketSchema);

export default EventTicket;
