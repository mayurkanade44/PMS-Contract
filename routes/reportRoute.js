import express from "express";
const router = express.Router();

import {
  addServiceData,
  clientReport,
  generateReport,
  serviceNotification,
} from "../controllers/reportController.js";
import {
  authenticateUser,
  authorizeUser,
} from "../middleware/authMiddleware.js";

router.post("/add", authenticateUser, addServiceData);
router.post(
  "/generate",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  generateReport
);
router.get("/clientReport/:id", clientReport);

router.get("/serviceDue", serviceNotification);

export default router;
