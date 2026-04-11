import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'BUY' | 'SELL';
  gameCoinAmount: number;
  ethAmount: number;
  previousBalance: number;
  newBalance: number;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  gameCoinAmount: { type: Number, required: true },
  ethAmount: { type: Number, required: true },
  previousBalance: { type: Number, required: true },
  newBalance: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);