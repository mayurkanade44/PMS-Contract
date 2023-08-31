import express from "express";
const router = express.Router();

import {
  addServiceData,
  allStats,
  clientReport,
  dailyServices,
  generateReport,
  monthlyServiceDue,
  sendServiceNotification,
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
router.get("/serviceDueMail", sendServiceNotification);
router.post(
  "/monthlyServices",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  monthlyServiceDue
);
router.get(
  "/dailyServices",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  dailyServices
);
router.get("/allStats", authenticateUser, allStats);

export default router;
