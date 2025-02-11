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
    direction: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    QandA: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
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
    // ticketPrice: {
    //   type: Number,
    //   required: function () {
    //     return this.ticketType === "paid";
    //   },
    //   min: [0, "Price cannot be negative"],
    // },
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
    isPublished: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    availableCodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Code",
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
    },
    pricingPlan: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      required: true,
    },
    commissionBornedBy: {
      type: String,
      enum: ["bearer", "customer"],
      required: true,
    },
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventTicket",
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
