import mongoose from "mongoose";

const connectDB = async (url) => {
  return await mongoose.connect(url, {
    dbName: "Ticket_Island",
  });
};

export default connectDB;
