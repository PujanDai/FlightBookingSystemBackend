import mongoose from "mongoose";

const passengerSchema = mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
    passportNumber: { type: String },
});

const priceHistorySchema = mongoose.Schema(
    {
        oldPrice: { type: Number, required: true },
        newPrice: { type: Number, required: true },
        reason: { type: String, required: true, trim: true },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const bookingSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        flight: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Flight",
            required: true,
        },
        passengers: [passengerSchema],
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "CANCELLED"],
            default: "PENDING",
        },
        paymentStatus: {
            type: String,
            enum: ["UNPAID", "PAID"],
            default: "UNPAID",
        },
        bookingReference: {
            type: String,
            unique: true,
        },
        expiresAt: {
            type: Date,
        },
        isExpired: {
            type: Boolean,
            default: false,
        },
        priceHistory: {
            type: [priceHistorySchema],
            default: [],
        },
        priceUpdatedAt: {
            type: Date,
        },
        lastUpdatedByAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to generate a booking reference
bookingSchema.pre("save", function (next) {
    if (!this.expiresAt) {
        const createdAtDate = this.createdAt ? new Date(this.createdAt) : new Date();
        this.expiresAt = new Date(createdAtDate.getTime() + 24 * 60 * 60 * 1000);
    }

    if (!this.bookingReference) {
        this.bookingReference = "FLX-" + Math.random().toString(36).toUpperCase().substring(2, 10);
    }
    next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
