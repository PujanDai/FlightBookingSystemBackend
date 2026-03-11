import mongoose from "mongoose";

const flightSchema = mongoose.Schema(
  {
    origin: {
      airportCode: { type: String, required: true },
      cityName: { type: String, required: true },
      airportName: { type: String, required: true },
      dateTime: { type: Date, required: true },
      terminal: { type: String },
    },
    destination: {
      airportCode: { type: String, required: true },
      cityName: { type: String, required: true },
      airportName: { type: String, required: true },
      dateTime: { type: Date, required: true },
    },
    operatorCode: { type: String, required: true },
    operatorName: { type: String, required: true },
    flightNumber: { type: String, required: true },
    cabinClass: { type: String },
    duration: { type: String },
    flightTime: { type: Number },
    distance: { type: Number },
    price: {
      currency: { type: String, default: "NPR" },
      totalDisplayFare: { type: Number, required: true },
    },
    attr: {
      baggage: { type: String },
      cabinBaggage: { type: String },
      availableSeats: { type: Number },
      isRefundable: { type: Boolean, default: false },
    },
    resultToken: { type: String },
    bookingSource: { type: String },
  },
  {
    timestamps: true,
  }
);

const Flight = mongoose.model("Flight", flightSchema);

export default Flight;
