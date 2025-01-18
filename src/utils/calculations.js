import ApiError from "./apiError.js";

export const calculateCommission = (priceToPay, plan) => {
  if (plan === "bronze") {
    const commission = (priceToPay * 5.5) / 100;
    return commission;
  } else if (plan === "silver") {
    const commission = (priceToPay * 7.5) / 100;
    return commission;
  } else if (plan === "gold") {
    const commission = (priceToPay * 10.5) / 100;
    return commission;
  } else {
    throw ApiError.internalServerError(`Plan Not recognized: ${plan}`);
  }
};
