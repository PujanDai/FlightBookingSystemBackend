import Notification from "../models/notificationModel.js";

/**
 * Persist an in-app notification for a booking event.
 * @param {{ userId: string, title: string, message: string, type?: string, bookingId?: string }} params
 */
export async function createBookingNotification({
    userId,
    title,
    message,
    type = "GENERAL",
    bookingId,
}) {
    return Notification.create({
        user: userId,
        title,
        message,
        type,
        booking: bookingId,
    });
}

/**
 * Cancellation confirmation shown in the notifications UI.
 */
export async function notifyBookingCancelled(booking) {
    const ref = booking.bookingReference || booking._id.toString();
    return createBookingNotification({
        userId: booking.user,
        title: "Booking Cancelled",
        message: `Your booking ${ref} has been cancelled successfully. No further changes can be made to this reservation.`,
        type: "BOOKING_CANCELLED",
        bookingId: booking._id,
    });
}
