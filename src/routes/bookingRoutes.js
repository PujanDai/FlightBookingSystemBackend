import express from "express";
import {
    createBooking,
    getMyBookings,
    getBookingById,
    getAllBookings,
    cancelBooking,
} from "../controllers/bookingController.js";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", verifyTokenMiddleware, isAdmin, getAllBookings);
router.post("/", verifyTokenMiddleware, createBooking);
router.get("/my", verifyTokenMiddleware, getMyBookings);
router.post("/:id/cancel", verifyTokenMiddleware, cancelBooking);
router.get("/:id", verifyTokenMiddleware, getBookingById);

export default router;
