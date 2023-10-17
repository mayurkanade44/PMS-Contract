import express from "express";
const router = express.Router();

import {
  addServiceData,
  allStats,
  clientReport,
  dailyServices,
  expireContractsReport,
  generateReport,
  monthlyServiceDue,
  quarterlyReport,
  sendQuarterlyReport,
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
router.get("/quarterlyReport", quarterlyReport);
router.get("/sendQuarterlyReport", sendQuarterlyReport);

router.post(
  "/monthlyServices",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  monthlyServiceDue
);
router.post(
  "/contractExpiry",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  expireContractsReport
);
router.get(
  "/dailyServices",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  dailyServices
);
router.get("/allStats", authenticateUser, allStats);

export default router;
