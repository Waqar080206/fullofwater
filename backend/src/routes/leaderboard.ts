import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

// GET /api/leaderboard?limit=50
router.get('/', async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const users = await User.find({})
    .sort({ totalPoints: -1 })
    .limit(limit)
    .select('username walletAddress totalPoints rank rankName');
  res.json(users);
});

export default router;