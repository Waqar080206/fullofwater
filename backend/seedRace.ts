// backend/seedRace.ts
import mongoose from 'mongoose';
import Race from './src/models/Race';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to MongoDB...");

  const newRace = await Race.create({
    name: "Bahrain Grand Prix 2026",
    round: 1,
    season: 2026,
    circuit: "Bahrain International Circuit",
    country: "Bahrain",
    qualifyingDate: new Date("2026-03-01T15:00:00Z"),
    raceDate: new Date("2026-03-02T15:00:00Z"),
    status: "upcoming",
    results: [],
    constructorResults: [],
    isSettled: false
  });

  console.log("Success! Created Race:", newRace.name);
  process.exit();
}

seed().catch(err => {
  console.error("Error staging race:", err);
  process.exit(1);
});