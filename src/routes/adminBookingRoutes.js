import express from "express";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { adminUpdateBookingPrice } from "../controllers/bookingController.js";

const router = express.Router();

router.patch("/:id/price", verifyTokenMiddleware, isAdmin, adminUpdateBookingPrice);

export default router;
