import express from "express";
import {
  addBilling,
  createInvoice,
  getAllInvoices,
  getBillDetails,
  updateBillDetails,
  updateInvoice,
} from "../controllers/billingController.js";
import { authorizeUser } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authorizeUser("Admin", "Back Office"), getAllInvoices);
router.route("/add").post(authorizeUser("Admin", "Back Office"), addBilling);
router
  .route("/singleBill/:id")
  .get(authorizeUser("Admin", "Back Office"), getBillDetails)
  .put(authorizeUser("Admin", "Back Office"), updateBillDetails);
router
  .route("/invoice/:id")
  .post(authorizeUser("Admin", "Back Office"), createInvoice)
  .put(authorizeUser("Admin", "Back Office"), updateInvoice);

export default router;
