import asyncHandler from "express-async-handler";
import {
    getNotificationsForUser,
    markNotificationAsRead,
} from "../services/notification.service.js";

// @desc    Get logged in user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await getNotificationsForUser(req.userId);
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markMyNotificationRead = asyncHandler(async (req, res) => {
    try {
        const notification = await markNotificationAsRead({
            notificationId: req.params.id,
            userId: req.userId,
        });
        res.json(notification);
    } catch (error) {
        res.status(error.statusCode || 500);
        throw new Error(error.message || "Failed to mark notification as read");
    }
});
