import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  userId: mongoose.Types.ObjectId;
  raceId: mongoose.Types.ObjectId;
  name?: string;               // Optional team name
  drivers: string[];           // array of 3 driver IDs (from constants)
  constructorId: string;       // constructor ID
  totalCost: number;           // must be <= 60,000,000
  points: number;              // points earned this race
  mode: 'free' | 'pro';        // game mode selected
  lockedAt: Date;              // locked before qualifying
  isLocked: boolean;
}

const TeamSchema = new Schema<ITeam>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  raceId: { type: Schema.Types.ObjectId, ref: 'Race', required: true },
  name: { type: String, default: 'My Racing Team' },
  drivers: { type: [String], required: true, validate: (v: string[]) => v.length === 3 },
  constructorId: { type: String, required: true },
  totalCost: { type: Number, required: true },
  points: { type: Number, default: 0 },
  mode: { type: String, enum: ['free', 'pro'], default: 'free' },
  lockedAt: { type: Date },
  isLocked: { type: Boolean, default: false },
});

// One team per user per race
TeamSchema.index({ userId: 1, raceId: 1 }, { unique: true });

export default mongoose.model<ITeam>('Team', TeamSchema);