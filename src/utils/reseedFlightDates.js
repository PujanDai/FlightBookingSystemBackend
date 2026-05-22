/**
 * Flight date re-shift utility.
 *
 * Re-anchors the dates of flights ALREADY in the database so the earliest
 * departure is ~SEED_LEAD_DAYS from now — without re-importing the JSON file.
 *
 * Use this for a quick pre-demo refresh when the seeded data has aged but you
 * do not want a full re-seed (e.g. you have bookings that reference flights).
 *
 * Run with:  npm run seed:dates
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import Flight from "../models/flightModel.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const SEED_LEAD_DAYS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

const reseedDates = async () => {
    try {
        await connectDB();

        const flights = await Flight.find({}, { "origin.dateTime": 1, "destination.dateTime": 1 });

        if (flights.length === 0) {
            console.log("No flights in the database. Run `npm run seed` first.".yellow);
            await mongoose.connection.close();
            process.exit(0);
        }

        const earliestMs = Math.min(
            ...flights.map((f) => new Date(f.origin.dateTime).getTime())
        );
        const targetMs = Date.now() + SEED_LEAD_DAYS * DAY_MS;
        const deltaMs = targetMs - earliestMs;

        const ops = flights.map((f) => ({
            updateOne: {
                filter: { _id: f._id },
                update: {
                    $set: {
                        "origin.dateTime": new Date(new Date(f.origin.dateTime).getTime() + deltaMs),
                        "destination.dateTime": new Date(
                            new Date(f.destination.dateTime).getTime() + deltaMs
                        ),
                    },
                },
            },
        }));

        await Flight.bulkWrite(ops);

        console.log(
            `Re-shifted ${flights.length} flight dates. Earliest departure is now ~${SEED_LEAD_DAYS} days out.`
                .green.inverse
        );
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(`Reseed-dates failed: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

reseedDates();
