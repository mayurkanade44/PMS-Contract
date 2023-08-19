import express from "express";
import {
  addCard,
  deleteCard,
  getSingleCard,
  sendContract,
  updateCard,
} from "../controllers/serviceController.js";
import { authorizeUser } from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/add-card").post(authorizeUser("Admin", "Back Office"), addCard);
router
  .route("/send-contract/:id")
  .put(authorizeUser("Admin", "Back Office"), sendContract);
router
  .route("/:id")
  .put(authorizeUser("Admin", "Back Office"), updateCard)
  .delete(authorizeUser("Admin"), deleteCard)
  .get(getSingleCard);

export default router;
