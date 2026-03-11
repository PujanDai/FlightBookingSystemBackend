import mongoose from "mongoose";

const passengerSchema = mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
    passportNumber: { type: String },
});

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
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to generate a booking reference
bookingSchema.pre("save", function (next) {
    if (!this.bookingReference) {
        this.bookingReference = "FLX-" + Math.random().toString(36).toUpperCase().substring(2, 10);
    }
    next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
