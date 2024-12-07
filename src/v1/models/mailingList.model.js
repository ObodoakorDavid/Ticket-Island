import mongoose from "mongoose";

const { Schema } = mongoose;

const MailingListSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      unique: [true, "This email is already subscribed to the mailing list"],
    },
    firstName: {
      type: String,
      required: [true, "Please provide a firstName"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide a lastName"],
    },
    isSubscribed: {
      type: Boolean,
      default: true, // Default to true since they are joining the mailing list
    },
    subscriptionDate: {
      type: Date,
      default: Date.now,
    },
    unsubscribedDate: {
      type: Date,
      default: null, // Set to null until the user unsubscribes
    },
  },
  {
    timestamps: true, // Automatically includes createdAt and updatedAt
  }
);

export default mongoose.model("MailingList", MailingListSchema);
