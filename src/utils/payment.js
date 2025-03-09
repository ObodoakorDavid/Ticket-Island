import ApiError from "./apiError.js";
import dotenv from "dotenv";
import paystackClient from "../lib/paystackClient.js";
dotenv.config();

export const payWithPayStack = async (email, amount, ticketId) => {
  try {
    const response = await paystackClient.post(
      "/transaction/initialize",
      {
        email,
        amount: amount * 100,
        callback_url: `${process.env.SERVER_BASE_URL}/api/v1/tickets/verify?ticketId=${ticketId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return {
      authorizationUrl: response.data.data.authorization_url,
    };
  } catch (error) {
    console.log(error?.response?.data);
    if (error?.response?.data) {
      throw ApiError.serviceUnavailable("Payment Gateway Unavailable");
    }

    throw ApiError.internalServerError("Something went wrong");
  }
};

export const verifyPayStackPayment = async (reference) => {
  try {
    const response = await paystackClient.get(
      `/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === "success") {
      // Handle successful payment here
      return {
        message: "Payment successful",
        data: response.data.data,
      };
    } else {
      return { message: "Payment failed", data: { status: "failed" } };
    }
  } catch (error) {
    const { message } = error?.response?.data;
    if (message) {
      throw ApiError.badRequest(message);
    }

    throw ApiError.badRequest("Verification Failed" + error?.response?.data);
  }
};

// Function to interact with Paystack API for withdrawal
export const initiatePaystackWithdrawal = async (amount, recipient) => {
  try {
    const response = await paystackClient.post("/transfer", {
      source: "balance",
      reason: "Withdrawal from wallet",
      amount: amount * 100,
      recipient,
    });

    if (response.status === 200) {
      return { status: "success", data: response.data.data };
    } else {
      return { status: "failed", data: response.data.data };
    }
  } catch (error) {
    console.error("Paystack API error:", error?.response?.data || error);
    if (error?.response?.data?.code === "insufficient_balance") {
      throw ApiError.serviceUnavailable(
        `Paystack: ${error.response?.data?.message}`
      );
    }
    return { status: "failed", data: error.message };
  }
};

// Function to interact with Paystack API for withdrawal
export const verifyPaystackSignature = async (req) => {
  const paystackSignature = req.headers["x-paystack-signature"];

  if (!paystackSignature) {
    throw ApiError.badRequest("Signature missing");
  }

  // Verify Paystack signature (Ensure you have PAYSTACK_SECRET_KEY in your env)
  const crypto = await import("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== paystackSignature) {
    throw ApiError.unauthorized("Invalid signature");
  }
};
