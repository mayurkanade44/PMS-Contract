import express from "express";
import {
  addCard,
  createCard,
  deleteCard,
  updateCard,
} from "../controllers/serviceController.js";
const router = express.Router();

router.route("/add-card").post(addCard);
router.route("/create-card/:id").put(createCard);
router.route("/:id").put(updateCard).delete(deleteCard);

export default router;
