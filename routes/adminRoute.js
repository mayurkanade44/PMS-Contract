import express from "express";
import {
  addAdminValue,
  addUser,
  deleteAdminValue,
  deleteUser,
  getAllUsers,
  getAllValues,
} from "../controllers/adminController.js";
const router = express.Router();

router
  .route("/value")
  .post(addAdminValue)
  .delete(deleteAdminValue)
  .get(getAllValues);

router.route("/user").get(getAllUsers).delete(deleteUser).post(addUser);

export default router;
