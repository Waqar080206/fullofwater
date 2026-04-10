import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;       // lowercase Ethereum address, unique
  username: string;
  totalPoints: number;         // cumulative seasonal points
  rank: number;                // 1-10
  rankName: string;
  gameCoins: number;           // off-chain balance mirror
  tier: 'free' | 'paid';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  walletAddress: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
  rank: { type: Number, default: 1 },
  rankName: { type: String, default: 'P10 / Points Hunter' },
  gameCoins: { type: Number, default: 0 },
  tier: { type: String, enum: ['free', 'paid'], default: 'free' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);