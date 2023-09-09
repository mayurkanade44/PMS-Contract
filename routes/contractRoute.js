import express from "express";
import {
  createContract,
  deactiveContract,
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
  .put(authorizeUser("Admin", "Back Office"), updateContract);

router.put(
  "/deactive/:id",
  authorizeUser("Admin", "Back Office"),
  deactiveContract
);

export default router;
