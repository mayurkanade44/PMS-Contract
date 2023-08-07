import express from "express";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import userRouter from "./routes/userRoute.js";
import contractRouter from "./routes/contractRoute.js";
import { notFound } from "./middleware/notFound.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use("/api/user", userRouter);
app.use("/api/contract", contractRouter);

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
