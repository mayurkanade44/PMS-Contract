import express from "express";
const router = express.Router();

import { addServiceReport, generateReport } from "../controllers/reportController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

router.post("/add", authenticateUser, addServiceReport);
router.post("/generate", generateReport);

export default router;
