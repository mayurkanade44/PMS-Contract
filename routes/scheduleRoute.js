import express from "express";
import {
  addScheduleByClient,
  getAllSchedules,
  updateSchedule,
  getAllTechnicians,
} from "../controllers/scheduleController.js";
import {
  authenticateUser,
  authorizeUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  getAllSchedules
);
router.post("/byClient", addScheduleByClient);
router.get(
  "/allTechnicians",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  getAllTechnicians
);
router.put(
  "/:id",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  updateSchedule
);

export default router;
