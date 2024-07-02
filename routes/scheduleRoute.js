import express from "express";
import {
  addScheduleByClient,
  getAllSchedules,
} from "../controllers/scheduleController.js";
import {
  authenticateUser,
  authorizeUser,
} from "../middleware/authMiddleware.js";
const router = express.Router();

router.get(
  "/",
  //   authenticateUser,
  //   authorizeUser("Admin", "Back Office"),
  getAllSchedules
);
router.post("/byClient", addScheduleByClient);

export default router;
