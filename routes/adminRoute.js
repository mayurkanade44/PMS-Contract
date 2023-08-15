import express from "express";
import {
  addAdminValue,
  deleteAdminValue,
} from "../controllers/adminController.js";
const router = express.Router();

router.route("/value").post(addAdminValue).delete(deleteAdminValue);

export default router;
