/**
 * Flight database seeder.
 *
 * Reads dummy_data/dummy_flights.json (a flat array produced by
 * dummy_flight_generator.py), re-anchors every flight's dates to a window
 * starting ~SEED_LEAD_DAYS days from "now" (date-shift normalisation), then
 * replaces the `flights` collection.
 *
 * Run with:  npm run seed
 *
 * Only the `flights` collection is touched — users and bookings are untouched.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import Flight from "../models/flightModel.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dummy_flights.json lives at the workspace root: <root>/dummy_data/dummy_flights.json
const DATA_FILE = path.join(__dirname, "../../../dummy_data/dummy_flights.json");

// Earliest seeded departure will be this many days from the moment seeding runs.
const SEED_LEAD_DAYS = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The generator emits dates as "YYYY-MM-DD HH:MM:SS". Normalise to an
 * ISO-style string so Date parsing is reliable across environments.
 */
const parseDateTime = (value) => {
    const normalised = typeof value === "string" ? value.replace(" ", "T") : value;
    const date = new Date(normalised);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date value in data file: ${value}`);
    }
    return date;
};

const importData = async () => {
    try {
        await connectDB();

        if (!fs.existsSync(DATA_FILE)) {
            throw new Error(
                `Data file not found: ${DATA_FILE}\n` +
                `Generate it first:  python dummy_data/dummy_flight_generator.py`
            );
        }

        console.log("Reading data file...".cyan);
        const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

        if (!Array.isArray(raw) || raw.length === 0) {
            throw new Error("dummy_flights.json must be a non-empty array.");
        }

        // Map raw generator records -> Flight documents.
        const flights = raw.map((item) => {
            const detail = item.FlightDetails.Details[0][0];
            return {
                origin: {
                    airportCode: detail.Origin.AirportCode,
                    cityName: detail.Origin.CityName,
                    airportName: detail.Origin.AirportName,
                    dateTime: parseDateTime(detail.Origin.DateTime),
                    terminal: detail.Origin.Terminal,
                },
                destination: {
                    airportCode: detail.Destination.AirportCode,
                    cityName: detail.Destination.CityName,
                    airportName: detail.Destination.AirportName,
                    dateTime: parseDateTime(detail.Destination.DateTime),
                },
                operatorCode: detail.OperatorCode,
                operatorName: detail.OperatorName,
                flightNumber: String(detail.FlightNumber),
                cabinClass: detail.CabinClass,
                duration: detail.Duration,
                flightTime: detail.FlightTime,
                distance: detail.Distance,
                price: {
                    currency: item.Price.Currency,
                    totalDisplayFare: item.Price.TotalDisplayFare,
                },
                attr: {
                    baggage: detail.Attr.Baggage,
                    cabinBaggage: detail.Attr.CabinBaggage,
                    availableSeats: detail.Attr.AvailableSeats,
                    isRefundable: item.Attr.IsRefundable === 1,
                },
                resultToken: item.ResultToken,
                bookingSource: item.booking_source,
            };
        });

        // --- Date-shift normalisation -------------------------------------
        // Re-anchor the whole dataset so the earliest departure is exactly
        // SEED_LEAD_DAYS from now. The same offset is applied to every flight,
        // preserving each flight's duration and the overall spread.
        const earliestMs = Math.min(...flights.map((f) => f.origin.dateTime.getTime()));
        const targetMs = Date.now() + SEED_LEAD_DAYS * DAY_MS;
        const deltaMs = targetMs - earliestMs;

        flights.forEach((f) => {
            f.origin.dateTime = new Date(f.origin.dateTime.getTime() + deltaMs);
            f.destination.dateTime = new Date(f.destination.dateTime.getTime() + deltaMs);
        });

        const windowStart = new Date(Math.min(...flights.map((f) => f.origin.dateTime.getTime())));
        const windowEnd = new Date(Math.max(...flights.map((f) => f.origin.dateTime.getTime())));
        console.log(`Date-shifted ${flights.length} flights.`.cyan);
        console.log(
            `  Departure window: ${windowStart.toDateString()}  ->  ${windowEnd.toDateString()}`.cyan
        );

        console.log("Clearing existing flights...".yellow);
        await Flight.deleteMany();

        console.log("Inserting new flights...".green);
        await Flight.insertMany(flights);

        console.log(`Data imported successfully! (${flights.length} flights)`.green.inverse);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(`Seed failed: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

importData();
