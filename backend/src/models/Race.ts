import mongoose, { Schema, Document } from 'mongoose';

export interface IRace extends Document {
  name: string;                  // e.g. "Monaco Grand Prix 2025"
  round: number;
  season: number;
  circuit: string;
  country: string;
  qualifyingDate: Date;
  raceDate: Date;
  status: 'upcoming' | 'qualifying' | 'active' | 'completed';
  results: {
    driverId: string;
    position: number;
    points: number;              // official F1 championship points
    fastestLap: boolean;
    dnf: boolean;
    overtakes: number;           // manual entry
    qualifyingPosition: number;
  }[];
  constructorResults: {
    constructorId: string;
    points: number;
  }[];
  isSettled: boolean;            // true after admin finalizes results
}

const RaceSchema = new Schema<IRace>({
  name: { type: String, required: true },
  round: { type: Number, required: true },
  season: { type: Number, required: true },
  circuit: String,
  country: String,
  qualifyingDate: Date,
  raceDate: Date,
  status: { type: String, enum: ['upcoming', 'qualifying', 'active', 'completed'], default: 'upcoming' },
  results: [{
    driverId: String,
    position: Number,
    points: Number,
    fastestLap: { type: Boolean, default: false },
    dnf: { type: Boolean, default: false },
    overtakes: { type: Number, default: 0 },
    qualifyingPosition: Number,
  }],
  constructorResults: [{
    constructorId: String,
    points: Number,
  }],
  isSettled: { type: Boolean, default: false },
});

export default mongoose.model<IRace>('Race', RaceSchema);