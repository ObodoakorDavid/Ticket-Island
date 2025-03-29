import mongoose from "mongoose";

const OrganizerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
      trim: true,
    },
    address1: {
      type: String,
      required: true,
      trim: true,
    },
    address2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    twitterLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return (
            !v || /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/.test(v)
          );
        },
        message: "Invalid Twitter URL",
      },
    },
    instagramLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return (
            !v || /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+$/.test(v)
          );
        },
        message: "Invalid Instagram URL",
      },
    },
    facebookLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return (
            !v || /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+$/.test(v)
          );
        },
        message: "Invalid Facebook URL",
      },
    },
  },
  { timestamps: true }
);

export const Organizer = mongoose.model("Organizer", OrganizerSchema);
