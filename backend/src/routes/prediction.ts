import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import Prediction from '../models/Prediction';
import Bet from '../models/Bet';
import User from '../models/User';
import Race from '../models/Race';
import Team from '../models/Team';
import { generatePredictionQuestions } from '../services/gemini';

const router = Router();

// GET /api/prediction/:raceId — get predictions for a race
router.get('/:raceId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const predictions = await Prediction.find({ raceId: req.params.raceId });
  res.json(predictions);
});

// POST /api/prediction/generate/:raceId — admin generates questions using Gemini
router.post('/generate/:raceId', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const race = await Race.findById(req.params.raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  const questions = await generatePredictionQuestions(race.name, race.circuit, race.country, race.round);

  const predictions = await Prediction.insertMany(
    questions.map(q => ({
      raceId: race._id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      status: 'open',
      poolA: 0,
      poolB: 0
    }))
  );
  res.json(predictions);
});

// POST /api/prediction/bet — user places a bet
// Body: { predictionId, raceId, chosenOption: 'A'|'B', amountStaked }
router.post('/bet', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { predictionId, raceId, chosenOption, amountStaked } = req.body;

  const user = await User.findById(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  let totalAvailable = user.gameCoins; const userTeam = await Team.findOne({ userId: req.user!.userId, raceId }); if (userTeam && userTeam.totalCost) { totalAvailable += (60_000_000 - userTeam.totalCost); } if (totalAvailable < amountStaked) return res.status(400).json({ error: 'Insufficient GameCoins' });

  const prediction = await Prediction.findById(predictionId);
  if (!prediction) return res.status(404).json({ error: 'Prediction not found' });
  if (prediction.status !== 'open') return res.status(400).json({ error: 'Prediction market is not open' });

  const existing = await Bet.findOne({ userId: req.user!.userId, predictionId });
  if (existing) return res.status(400).json({ error: 'Already bet on this prediction' });

  // Deduct leftover budget then GC
  if (userTeam && userTeam.totalCost) {
    const leftover = 60_000_000 - userTeam.totalCost;
    if (leftover >= amountStaked) {
      userTeam.totalCost += amountStaked;
      await userTeam.save();
    } else {
      const rem = amountStaked - leftover;
      userTeam.totalCost = 60_000_000;
      await userTeam.save();
      user.gameCoins -= rem;
      await user.save();
    }
  } else {
    user.gameCoins -= amountStaked;
    await user.save();
  }
  
  // Atomically increment the relevant pool
  if (chosenOption === 'A') {
    prediction.poolA += amountStaked;
  } else {
    prediction.poolB += amountStaked;
  }
  await prediction.save();

  const bet = await Bet.create({
    userId: req.user!.userId,
    predictionId,
    raceId,
    chosenOption,
    amountStaked,
  });

  res.json(bet);
});

// POST /api/prediction/settle/:predictionId — admin settles prediction
// Body: { correctOption: 'A' | 'B' }
router.post('/settle/:predictionId', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { correctOption } = req.body;
  const prediction = await Prediction.findByIdAndUpdate(
    req.params.predictionId,
    { correctOption, status: 'settled', isSettled: true },
    { new: true }
  );

  if (!prediction) return res.status(404).json({ error: 'Prediction not found' });

  const totalPool = prediction.poolA + prediction.poolB;
  const allocatablePool = totalPool * 0.95; // 5% house edge
  
  const winningPoolAmount = correctOption === 'A' ? prediction.poolA : prediction.poolB;
  const winningMultiplier = winningPoolAmount > 0 ? (allocatablePool / winningPoolAmount) : 1; // if 0, multiplier fallback

  // Settle all bets for this prediction
  const bets = await Bet.find({ predictionId: prediction._id, result: 'pending' });

  for (const bet of bets) {
    const won = bet.chosenOption === correctOption;
    bet.result = won ? 'win' : 'loss';
    bet.settledAt = new Date();
    
    if (won && winningPoolAmount > 0) {
      const payout = Math.floor(bet.amountStaked * winningMultiplier);
      await User.findByIdAndUpdate(bet.userId, {
        $inc: { gameCoins: payout },
      });
    } else if (won && winningPoolAmount === 0) {
      // Refund if somehow pool was 0 (shouldn't happen for a winning bet, but fallback)
      await User.findByIdAndUpdate(bet.userId, {
        $inc: { gameCoins: bet.amountStaked },
      });
    }
    
    await bet.save();
    // loss: coins already deducted at bet time
  }

  res.json({ settled: bets.length, prediction });
});

export default router;


