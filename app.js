import express from "express";
import fileUpload from "express-fileupload";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/connectDB.js";
import notFound from "./src/middlewares/notFound.js";
import { errorMiddleware } from "./src/middlewares/error.js";

import authRoutesV1 from "./src/v1/routes/auth.routes.js";
import eventRoutesV1 from "./src/v1/routes/event.routes.js";
import ticketRoutesV1 from "./src/v1/routes/ticket.routes.js";
import codeRoutesV1 from "./src/v1/routes/code.routes.js";
import orderRoutesV1 from "./src/v1/routes/order.routes.js";
import adminRoutesV1 from "./src/v1/modules/admin/admin.routes.js";
import promotionalEmailRoutesV1 from "./src/v1/modules/promotionalEmail/promotionalEmail.routes.js";
import walletRoutesV1 from "./src/v1/modules/wallet/wallet.routes.js";
import transactionRoutesV1 from "./src/v1/routes/transaction.routes.js";
import organizerRoutesV1 from "./src/v1/modules/organizer/organizer.routes.js";
import analyticsRoutesV1 from "./src/v1/routes/analytics.routes.js";
import waitlistRoutesV1 from "./src/v1/routes/waitlist.routes.js";
import { isAdmin, isAuth } from "./src/middlewares/auth.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutesV1);
app.use("/api/v1/events", eventRoutesV1);
app.use("/api/v1/tickets", ticketRoutesV1);
app.use("/api/v1/codes", isAuth, codeRoutesV1);
app.use("/api/v1/orders", isAuth, orderRoutesV1);
app.use("/api/v1/admin", isAuth, isAdmin, adminRoutesV1);
app.use("/api/v1/waitlist", waitlistRoutesV1);
app.use("/api/v1/promotional-email", promotionalEmailRoutesV1);
app.use("/api/v1/wallet", walletRoutesV1);
app.use("/api/v1/transaction", transactionRoutesV1);
app.use("/api/v1/analytics", analyticsRoutesV1);
app.use("/api/v1/organizer", organizerRoutesV1);
// app.use("/api/v1/admin", adminRoutes);
app.use(notFound);
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDB(process.env.DB_URI);
    console.log(`DB Connected!`);
    app.listen(port, () => console.log(`Server is listening on PORT:${port}`));
  } catch (error) {
    console.log(`Couldn't connect because of ${error.message}`);
    process.exit(1);
  }
};

startServer();
