import mongoose, { Schema, Document } from 'mongoose';

export interface IBet extends Document {
  userId: mongoose.Types.ObjectId;
  predictionId: mongoose.Types.ObjectId;
  raceId: mongoose.Types.ObjectId;
  chosenOption: 'A' | 'B';
  amountStaked: number;          // in GameCoins
  result: 'win' | 'loss' | 'pending';
  settledAt: Date | null;
}

const BetSchema = new Schema<IBet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  predictionId: { type: Schema.Types.ObjectId, ref: 'Prediction', required: true },
  raceId: { type: Schema.Types.ObjectId, ref: 'Race', required: true },
  chosenOption: { type: String, enum: ['A', 'B'], required: true },
  amountStaked: { type: Number, required: true },
  result: { type: String, enum: ['win', 'loss', 'pending'], default: 'pending' },
  settledAt: { type: Date, default: null },
});

// One bet per user per prediction
BetSchema.index({ userId: 1, predictionId: 1 }, { unique: true });

export default mongoose.model<IBet>('Bet', BetSchema);