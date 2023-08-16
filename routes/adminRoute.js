import express from "express";
import {
  addAdminValue,
  deleteAdminValue,
  getAllValues,
} from "../controllers/adminController.js";
const router = express.Router();

router
  .route("/value")
  .post(addAdminValue)
  .delete(deleteAdminValue)
  .get(getAllValues);

export default router;
