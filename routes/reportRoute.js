import express from "express";
const router = express.Router();

import {
  addServiceReport,
  clientReport,
  generateReport,
} from "../controllers/reportController.js";
import {
  authenticateUser,
  authorizeUser,
} from "../middleware/authMiddleware.js";

router.post("/add", authenticateUser, addServiceReport);
router.post(
  "/generate",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  generateReport
);
router.get("/clientReport/:id", clientReport);

export default router;
