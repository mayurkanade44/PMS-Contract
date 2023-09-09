import express from "express";
import {
  addCard,
  createDigitalContract,
  getSingleCard,
  sendContract,
  updateCard,
} from "../controllers/serviceController.js";
import { authorizeUser } from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/addCard").post(authorizeUser("Admin", "Back Office"), addCard);
router
  .route("/digitalContract/:id")
  .put(authorizeUser("Admin", "Back Office"), createDigitalContract);
router
  .route("/sendContract/:id")
  .put(authorizeUser("Admin", "Back Office"), sendContract);
router
  .route("/:id")
  .put(authorizeUser("Admin", "Back Office"), updateCard)
  .get(getSingleCard);

export default router;
