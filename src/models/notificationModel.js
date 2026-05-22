import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["GENERAL", "BOOKING_CANCELLED", "BOOKING_CONFIRMED"],
            default: "GENERAL",
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
