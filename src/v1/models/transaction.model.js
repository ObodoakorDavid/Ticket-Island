import mongoose from "mongoose";

const { Schema } = mongoose;

// Transaction History for Wallet
const TransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    accountNumber: {
      type: String,
      default: null,
    },
    accountName: {
      type: String,
      default: null,
    },
    bankName: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: "", // Optional description for the transaction (e.g., "Fund added", "Withdrawal successful")
    },
    status: {
      type: String,
      enum: ["successful", "failed", "pending"],
      default: "pending",
    },
    reference: {
      type: String,
      default: null,
    },
    adminApproval: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  }
);

// Automatically set approvalDate if adminApproval is approved
TransactionSchema.pre("save", function (next) {
  if (this.adminApproval === "approved" && !this.approvalDate) {
    this.approvalDate = Date.now();
  }
  next();
});

export default mongoose.model("Transaction", TransactionSchema);
