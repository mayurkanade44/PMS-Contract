import express from "express";
import {
  addScheduleByClient,
  getAllSchedules,
  updateSchedule,
  getAllTechnicians,
  searchContract,
  addScheduleByPms,
  getTechnicianSchedules,
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
router
  .route("/byPms")
  .get(authenticateUser, authorizeUser("Admin", "Back Office"), searchContract)
  .post(
    authenticateUser,
    authorizeUser("Admin", "Back Office"),
    addScheduleByPms
  );
router.get(
  "/technicianSchedules",
  authenticateUser,
  authorizeUser("Technician"),
  getTechnicianSchedules
);
router.put(
  "/:id",
  authenticateUser,
  authorizeUser("Admin", "Back Office"),
  updateSchedule
);

export default router;
