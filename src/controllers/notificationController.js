import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";

const toClientNotification = (doc) => ({
    _id: doc._id,
    title: doc.title,
    message: doc.message,
    type: doc.type,
    booking: doc.booking,
    isRead: doc.isRead,
    read: doc.isRead,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
});

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.userId })
        .sort("-createdAt")
        .limit(100);
    res.json(notifications.map(toClientNotification));
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid notification ID");
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: id, user: req.userId },
        { $set: { isRead: true } },
        { new: true }
    );

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    res.json(toClientNotification(notification));
});
