import express from "express";
import {
  createContract,
  getContract,
} from "../controllers/contractController.js";
const router = express.Router();

router.route("/").post(createContract);
router.route("/singleContract/:id").get(getContract);

export default router;
