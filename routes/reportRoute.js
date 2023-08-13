import express from "express";
const router = express.Router();

import { addServiceReport } from "../controllers/reportController.js";

router.post("/add", addServiceReport);

export default router;
