import express from "express";
import {
    createBooking,
    getMyBookings,
    getBookingById,
    getAllBookings,
    updateBookingStatus,
    downloadBookingTicket,
} from "../controllers/bookingController.js";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", verifyTokenMiddleware, isAdmin, getAllBookings);
router.post("/", verifyTokenMiddleware, createBooking);
router.get("/my", verifyTokenMiddleware, getMyBookings);
router.get("/:id/ticket", verifyTokenMiddleware, downloadBookingTicket);
router.get("/:id", verifyTokenMiddleware, getBookingById);
router.put("/:id/status", verifyTokenMiddleware, isAdmin, updateBookingStatus);

export default router;
