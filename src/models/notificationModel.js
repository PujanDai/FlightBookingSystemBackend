import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["EXPIRY_WARNING", "PRICE_CHANGE", "PRICE_UPDATED"],
            required: true,
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true,
        },
        dedupeKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        data: {
            oldPrice: { type: Number },
            newPrice: { type: Number },
            difference: { type: Number },
            reason: { type: String, trim: true },
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ bookingId: 1, type: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
