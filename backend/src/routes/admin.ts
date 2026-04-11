import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import Race from '../models/Race';
import Team from '../models/Team';
import User from '../models/User';
import { calculateTeamPoints, getRankFromPoints } from '../services/scoring';
import { updateRankOnChain } from '../services/blockchain';

const router = Router();
router.use(authMiddleware, adminMiddleware);

// POST /api/admin/race — create a race
router.post('/race', async (req: AuthRequest, res: Response) => {
  const race = await Race.create(req.body);
  res.json(race);
});

// PUT /api/admin/race/:id/status — update race status
// Body: { status: 'qualifying' | 'active' | 'completed' }
router.put('/race/:id/status', async (req: AuthRequest, res: Response) => {
  const race = await Race.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

  // Lock all teams when qualifying starts
  if (req.body.status === 'qualifying') {
    await Team.updateMany({ raceId: req.params.id }, { isLocked: true, lockedAt: new Date() });
  }
  res.json(race);
});

// POST /api/admin/race/:id/results — enter race results manually
// Body: { results: [...], constructorResults: [...] }
router.post('/race/:id/results', async (req: AuthRequest, res: Response) => {
  const { results, constructorResults } = req.body;
  const race = await Race.findByIdAndUpdate(
    req.params.id,
    { results, constructorResults, status: 'completed', isSettled: true },
    { new: true }
  );
  if (!race) return res.status(404).json({ error: 'Race not found' });

  // Calculate points for all teams in this race
  const teams = await Team.find({ raceId: race._id });

  for (const team of teams) {
    const points = calculateTeamPoints(team.drivers, team.constructorId, results);
    team.points = points;
    await team.save();

    // Update user total points and rank
    const user = await User.findById(team.userId);
    if (user) {
      user.totalPoints += points;
      const { rank, rankName } = getRankFromPoints(user.totalPoints);
      user.rank = rank;
      user.rankName = rankName;
      await user.save();

      // Write rank on-chain (non-blocking, best-effort)
      updateRankOnChain(user.walletAddress, rank, rankName).catch(console.error);
    }
  }

  res.json({ message: 'Results settled', teamsUpdated: teams.length });
});

export default router;