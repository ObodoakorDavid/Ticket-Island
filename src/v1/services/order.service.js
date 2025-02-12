import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import Order from "../models/order.model.js";

// export async function createOrder(orderData, userId, userProfileId) {
//   const {
//     eventId,
//     tickets,
//     unit,
//     basePrice,
//     netPrice,
//     promoCode,
//     isPromoApplied,
//     commissionBornedBy,
//   } = orderData;

//   const order = new Order({
//     eventId,
//     userId,
//     user: userProfileId,
//     tickets,
//     unit,
//     basePrice,
//     netPrice,
//     promoCode,
//     isPromoApplied,
//     commissionBornedBy,
//   });
//   await order.save();
//   return ApiSuccess.ok("Order Created Successfully", { order });
// }

// Retrieve all orders

export async function getAllOrders(userId, query) {
  const { page = 1, limit = 10, search } = query;

  const filterQuery = { userId };
  const populateOptions = [
    {
      path: "user",
      select: "-userId",
    },
    {
      path: "eventId",
    },
    // {
    //   path: "tickets",
    //   select: "-qrcode",
    // },
  ];

  const sort = { createdAt: -1 };

  if (search) {
    const searchQuery = {
      $or: [
        { reference: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ],
    };
    Object.assign(filterQuery, searchQuery);
  }

  const { documents: orders, pagination } = await paginate({
    model: Order,
    query: filterQuery,
    page,
    limit,
    sort,
    populateOptions,
    select: ["-qrcode"],
  });

  return ApiSuccess.ok("Orders Retrieved Successfully", {
    orders,
    pagination,
  });
}

// Retrieve a specific order by ID
export async function getOrderById(orderId) {
  const order = await Order.findOne({
    _id: orderId,
  }).populate("tickets");

  if (!order) throw ApiError.notFound("Order not found");
  return ApiSuccess.ok("Order Retrieved Successfully", { order });
}

// // Update a specific order
// export async function updateOrder(orderId, data, userId) {
//   const order = await Order.findOneAndUpdate({ _id: orderId, userId }, data, {
//     new: true,
//   });

//   if (!order) throw ApiError.notFound("Order not found");

//   return ApiSuccess.ok("Order Updated Successfully", { order });
// }

// // Delete a specific order
// export async function deleteOrder(orderId) {
//   const order = await Order.findOneAndDelete({ _id: orderId });

//   if (!order) throw ApiError.notFound("Order not found");

//   return ApiSuccess.ok("Order Deleted Successfully");
// }

const orderService = {
  //   createOrder,
  getAllOrders,
  getOrderById,
  //   updateOrder,
  //   deleteOrder,
};

export default orderService;
