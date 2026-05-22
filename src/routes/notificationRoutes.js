import express from "express";
import {
    getMyNotifications,
    markNotificationRead,
} from "../controllers/notificationController.js";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";

const router = express.Router();

router.get("/", verifyTokenMiddleware, getMyNotifications);
router.patch("/:id/read", verifyTokenMiddleware, markNotificationRead);

export default router;
