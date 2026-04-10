import express from "express";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";
import {
    getMyNotifications,
    markMyNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyTokenMiddleware, getMyNotifications);
router.patch("/:id/read", verifyTokenMiddleware, markMyNotificationRead);

export default router;
