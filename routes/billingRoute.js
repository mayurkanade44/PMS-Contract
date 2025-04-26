import express from "express";
import {
  addBilling,
  createInvoice,
  getAllInvoices,
  getBillDetails,
  searchBill,
  updateBillDetails,
  updateInvoice,
  cancelInvoice,
} from "../controllers/billingController.js";
import { authorizeUser } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authorizeUser("Admin", "Back Office"), getAllInvoices);
router.get("/searchBill", authorizeUser("Admin", "Back Office"), searchBill);
router.route("/add").post(authorizeUser("Admin", "Back Office"), addBilling);
router
  .route("/singleBill/:id")
  .get(authorizeUser("Admin", "Back Office"), getBillDetails)
  .put(authorizeUser("Admin", "Back Office"), updateBillDetails);
router
  .route("/invoice/:id")
  .post(authorizeUser("Admin", "Back Office"), createInvoice)
  .put(authorizeUser("Admin", "Back Office"), updateInvoice);
router
  .route("/cancelInvoice/:id")
  .put(authorizeUser("Admin", "Back Office"), cancelInvoice);

export default router;
