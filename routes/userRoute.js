import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import {
  authenticateUser,
  authorizeUser,
} from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/login", loginUser);
router.post(
  "/register",
  authenticateUser,
  authorizeUser("Admin"),
  registerUser
);

export default router;
