import express from "express";
import {
  addCard,
  createCard,
  deleteCard,
  getSingleCard,
  updateCard,
} from "../controllers/serviceController.js";
import { authorizeUser } from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/add-card").post(authorizeUser("Admin", "Back Office"), addCard);
router
  .route("/create-card/:id")
  .put(authorizeUser("Admin", "Back Office"), createCard);
router
  .route("/:id")
  .put(authorizeUser("Admin", "Back Office"), updateCard)
  .delete(authorizeUser("Admin"), deleteCard)
  .get(getSingleCard);

export default router;
