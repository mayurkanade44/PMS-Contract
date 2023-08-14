import express from "express";
const router = express.Router();

import { addServiceReport } from "../controllers/reportController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

router.post("/add", authenticateUser, addServiceReport);

export default router;
