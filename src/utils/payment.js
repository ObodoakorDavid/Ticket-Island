import axios from "axios";
import ApiError from "./apiError";

export const payWithPayStack = async (email, amount, orderId, device) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        callback_url: `${process.env.SERVER_BASE_URL}/verify-payment?orderId=${orderId}&device=${device}`,
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
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
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
    throw error;
  }
};
