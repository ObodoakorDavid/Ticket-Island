import mongoose from "mongoose";

const { Schema } = mongoose;

// Transaction hHistory for Wallet
const TransactionHistorySchema = new Schema(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["credit", "debit"], // "credit" for adding funds, "debit" for withdrawal
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfterTransaction: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "", // Optional description for the transaction (e.g., "Fund added", "Withdrawal successful")
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  }
);

export default mongoose.model("TransactionHistory", TransactionHistorySchema);
