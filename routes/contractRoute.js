import express from "express";
import { createContract } from "../controllers/contractController.js";
const router = express.Router();

router.route("/").post(createContract);

export default router;
