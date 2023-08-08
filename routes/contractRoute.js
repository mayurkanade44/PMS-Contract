import express from "express";
import {
  createContract,
  deactiveContract,
  deleteContract,
  getContract,
  updateContract,
} from "../controllers/contractController.js";
const router = express.Router();

router.route("/").post(createContract);
router
  .route("/singleContract/:id")
  .get(getContract)
  .put(updateContract)
  .delete(deleteContract);
router.put("/deactive/:id", deactiveContract);

export default router;
