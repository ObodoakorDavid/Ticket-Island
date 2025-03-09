import mongoose from "mongoose";
const { Schema } = mongoose;

const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    recipientCode: {
      type: String,
      // required: [true, "Please provide a recipient code"],
    },
    bankName: {
      type: String,
      // required: [true, "Please provide a bank name"],
    },
    bankAccountNumber: {
      type: String,
      // required: [true, "Please provide a bank account number"],
    },
    currency: {
      type: String,
      // required: [true, "Please provide a bank account number"],
    },
    name: {
      type: String,
      // required: [true, "Please provide a name"],
    },
    isSubmitted: {
      type: Boolean,
      default: false,
      // required: [true, "Please provide a name"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Wallet", walletSchema);
