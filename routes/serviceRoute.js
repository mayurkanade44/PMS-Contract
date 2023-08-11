import express from "express";
import { addCard, deleteCard } from "../controllers/serviceController.js";
const router = express.Router();

router.route("/add-card").post(addCard);
router.route("/:id").delete(deleteCard);

export default router;
