import express from "express";
import {
  createContract,
  deactiveContract,
  deleteContract,
  getAllContracts,
  getAllValues,
  getContract,
  updateContract,
} from "../controllers/contractController.js";
import { authorizeUser } from "../middleware/authMiddleware.js";
const router = express.Router();

router
  .route("/")
  .post(authorizeUser("Admin", "Back Office"), createContract)
  .get(getAllContracts);

router.get("/getAllValues", getAllValues);
router
  .route("/singleContract/:id")
  .get(authorizeUser("Admin", "Back Office"), getContract)
  .put(authorizeUser("Admin", "Back Office"), updateContract)
  .delete(authorizeUser("Admin"), deleteContract);
router.put(
  "/deactive/:id",
  authorizeUser("Admin", "Back Office"),
  deactiveContract
);

export default router;
