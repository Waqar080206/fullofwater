import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import Prediction from '../models/Prediction';
import Bet from '../models/Bet';
import User from '../models/User';
import Race from '../models/Race';
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
      multiplierWin: q.multiplierWin,
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
  if (user.gameCoins < amountStaked) return res.status(400).json({ error: 'Insufficient GameCoins' });

  const prediction = await Prediction.findById(predictionId);
  if (!prediction || prediction.isSettled) return res.status(400).json({ error: 'Prediction not available' });

  const existing = await Bet.findOne({ userId: req.user!.userId, predictionId });
  if (existing) return res.status(400).json({ error: 'Already bet on this prediction' });

  // Deduct coins
  user.gameCoins -= amountStaked;
  await user.save();

  const bet = await Bet.create({
    userId: req.user!.userId,
    predictionId,
    raceId,
    chosenOption,
    amountStaked,
    potentialReturn: amountStaked * prediction.multiplierWin,
  });

  res.json(bet);
});

// POST /api/prediction/settle/:predictionId — admin settles prediction
// Body: { correctOption: 'A' | 'B' }
router.post('/settle/:predictionId', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { correctOption } = req.body;
  const prediction = await Prediction.findByIdAndUpdate(
    req.params.predictionId,
    { correctOption, isSettled: true },
    { new: true }
  );

  if (!prediction) return res.status(404).json({ error: 'Prediction not found' });

  // Settle all bets for this prediction
  const bets = await Bet.find({ predictionId: prediction._id, result: 'pending' });

  for (const bet of bets) {
    const won = bet.chosenOption === correctOption;
    bet.result = won ? 'win' : 'loss';
    bet.settledAt = new Date();
    await bet.save();

    if (won) {
      await User.findByIdAndUpdate(bet.userId, {
        $inc: { gameCoins: bet.potentialReturn },
      });
    }
    // loss: coins already deducted at bet time
  }

  res.json({ settled: bets.length, prediction });
});

export default router;