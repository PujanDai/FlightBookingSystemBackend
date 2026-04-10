import Notification from "../models/notificationModel.js";
import Booking from "../models/bookingModel.js";
import { sendBookingExpiryWarningEmail } from "../mailtrap/emails.js";

const EXPIRY_WARNING_SECONDS = 2 * 60 * 60;

const createNotificationIfNotExists = async (payload) => {
    const existing = await Notification.findOne({ dedupeKey: payload.dedupeKey }).lean();
    if (existing) {
        return { notification: existing, created: false };
    }

    const createdNotification = await Notification.create(payload);
    return { notification: createdNotification, created: true };
};

export const createPriceChangedNotification = async ({
    userId,
    bookingId,
    oldPrice,
    newPrice,
    reason,
    changeKey,
}) => {
    const numericOldPrice = Number(oldPrice || 0);
    const numericNewPrice = Number(newPrice || 0);
    const difference = Number((numericNewPrice - numericOldPrice).toFixed(2));
    const absoluteDifference = Math.abs(difference);
    const direction = difference > 0 ? "increased" : "decreased";
    const amountText = `NPR ${absoluteDifference.toLocaleString()}`;
    const oldPriceText = `NPR ${numericOldPrice.toLocaleString()}`;
    const newPriceText = `NPR ${numericNewPrice.toLocaleString()}`;
    const cleanReason = (reason || "").trim();

    const dedupeKey = changeKey || `PRICE_CHANGE:${String(bookingId)}:${newPrice}:${Date.now()}`;
    return createNotificationIfNotExists({
        userId,
        bookingId,
        type: "PRICE_CHANGE",
        dedupeKey,
        title: "Fare Updated",
        message: `Price ${direction} by ${amountText} (${oldPriceText} -> ${newPriceText})${
            cleanReason ? `. Reason: ${cleanReason}` : ""
        }`,
        data: {
            oldPrice: numericOldPrice,
            newPrice: numericNewPrice,
            difference,
            reason: cleanReason,
        },
        isRead: false,
    });
};

export const createExpiryWarningNotification = async ({ userId, bookingId }) => {
    const dedupeKey = `EXPIRY_WARNING:${String(bookingId)}`;
    return createNotificationIfNotExists({
        userId,
        bookingId,
        type: "EXPIRY_WARNING",
        dedupeKey,
        title: "Booking Expiry Warning",
        message: "Your booking expires in 2 hours",
        isRead: false,
    });
};

export const getNotificationsForUser = async (userId) => {
    return Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markNotificationAsRead = async ({ notificationId, userId }) => {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        const err = new Error("Notification not found");
        err.statusCode = 404;
        throw err;
    }
    if (notification.userId.toString() !== userId) {
        const err = new Error("Not authorized");
        err.statusCode = 403;
        throw err;
    }

    notification.isRead = true;
    await notification.save();
    return notification;
};

export const createPendingExpiryWarnings = async () => {
    const bookings = await Booking.find({
        paymentStatus: { $ne: "PAID" },
        isExpired: false,
    })
        .select("_id user expiresAt createdAt paymentStatus isExpired bookingReference")
        .populate("user", "name email");

    let createdCount = 0;
    for (const booking of bookings) {
        const expiresAt = booking.expiresAt
            ? new Date(booking.expiresAt)
            : new Date(new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000);
        const remainingTime = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
        if (remainingTime === 0 || remainingTime > EXPIRY_WARNING_SECONDS) {
            continue;
        }

        const result = await createExpiryWarningNotification({
            userId: booking.user?._id || booking.user,
            bookingId: booking._id,
        });
        if (result.created) {
            createdCount += 1;
            await sendBookingExpiryWarningEmail({ booking });
        }
    }

    return { createdCount };
};
