import Booking from "../models/bookingModel.js";

export const updateBookingPriceByAdmin = async ({
    bookingId,
    adminUserId,
    newPrice,
    changeType,
    percentage,
    reason,
}) => {
    const booking = await Booking.findById(bookingId)
        .populate("user", "name email")
        .populate("flight");

    if (!booking) {
        const err = new Error("Booking not found");
        err.statusCode = 404;
        throw err;
    }

    if (booking.paymentStatus === "PAID") {
        const err = new Error("Price cannot be updated after payment is completed");
        err.statusCode = 400;
        throw err;
    }

    const oldPrice = booking.totalPrice;
    let parsedPrice;
    let effectiveChangeType = "FIXED";

    if (changeType === "PERCENTAGE_INCREASE" || changeType === "PERCENTAGE_DECREASE") {
        const parsedPercentage = Number(percentage);
        if (!Number.isFinite(parsedPercentage) || parsedPercentage <= 0) {
            const err = new Error("percentage must be a positive number");
            err.statusCode = 400;
            throw err;
        }

        const multiplier = changeType === "PERCENTAGE_INCREASE"
            ? 1 + parsedPercentage / 100
            : 1 - parsedPercentage / 100;
        parsedPrice = Number((oldPrice * multiplier).toFixed(2));
        effectiveChangeType = changeType;

        if (parsedPrice <= 0) {
            const err = new Error("Price update would result in non-positive total price");
            err.statusCode = 400;
            throw err;
        }
    } else {
        parsedPrice = Number(newPrice);
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            const err = new Error("newPrice must be a positive number");
            err.statusCode = 400;
            throw err;
        }
    }

    if (parsedPrice === oldPrice) {
        return {
            noChange: true,
            message: "No price change detected",
            booking,
            oldPrice,
            newPrice: parsedPrice,
            difference: 0,
        };
    }

    const updateReason = (reason || "").trim();
    if (!updateReason) {
        const err = new Error("reason is required for price update");
        err.statusCode = 400;
        throw err;
    }

    booking.totalPrice = parsedPrice;
    booking.priceUpdatedAt = new Date();
    booking.lastUpdatedByAdmin = adminUserId;
    booking.priceHistory.push({
        oldPrice,
        newPrice: parsedPrice,
        reason: updateReason,
        changedBy: adminUserId,
        createdAt: new Date(),
    });

    const savedBooking = await booking.save();
    const updatedBooking = await Booking.findById(savedBooking._id)
        .populate("user", "name email")
        .populate("flight");

    return {
        noChange: false,
        message: "Booking price updated successfully",
        booking: updatedBooking,
        oldPrice,
        newPrice: parsedPrice,
        difference: parsedPrice - oldPrice,
        reason: updateReason,
        changeType: effectiveChangeType,
    };
};
