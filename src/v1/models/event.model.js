import mongoose from "mongoose";

const { Schema } = mongoose;

const eventSchema = new Schema(
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
    photo: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: ["single", "recurring"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    descriptionToLocation: {
      type: String,
      required: true,
    },
    locationURL: {
      type: String,
      required: true,
    },
    additionalInformation: {
      type: String,
    },
    ticketType: {
      type: String,
      enum: ["free", "paid"],
      required: true,
    },
    ticketPrice: {
      type: Number,
      required: function () {
        return this.ticketType === "paid";
      },
      min: [0, "Price cannot be negative"],
    },
    agendaTitle: {
      type: String,
    },
    agendaStartTime: {
      type: Date,
    },
    agendaEndTime: {
      type: Date,
    },
    agendaHostName: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: { type: Boolean, default: false },
    availableCodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Code",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
