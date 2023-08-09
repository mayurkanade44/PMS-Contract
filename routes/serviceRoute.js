import express from 'express'
import { addCard } from '../controllers/serviceController.js'
const router = express.Router()


router.route("/add-card").post(addCard)



export default router
