import express from "express";
import {
  createContract,
  getContract,
  updateContract,
} from "../controllers/contractController.js";
const router = express.Router();

router.route("/").post(createContract);
router.route("/singleContract/:id").get(getContract).put(updateContract);

export default router;
