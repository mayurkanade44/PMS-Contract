import express from "express";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";

//Security packages
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";


//Routing
import userRouter from "./routes/userRoute.js";
import contractRouter from "./routes/contractRoute.js";
import serviceRouter from "./routes/serviceRoute.js";
import reportRouter from "./routes/reportRoute.js";
import adminRouter from "./routes/adminRoute.js";

//Middleware
import { notFound } from "./middleware/notFound.js";
import {
  authenticateUser,
  authorizeUser,
} from "./middleware/authMiddleware.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const app = express();

app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use("/api/user", userRouter);
app.use("/api/contract", authenticateUser, contractRouter);
app.use("/api/service", authenticateUser, serviceRouter);
app.use("/api/report", reportRouter);
app.use("/api/admin", authenticateUser, authorizeUser("Admin"), adminRouter);

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/client/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

app.use(notFound);

const port = process.env.PORT || 5000;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(port, () => console.log("server is listing"));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();
