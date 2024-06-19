import express from "express";
import { addScheduleByClient } from "../controllers/scheduleController.js";
const router = express.Router();

router.post("/byClient", addScheduleByClient);

export default router;
