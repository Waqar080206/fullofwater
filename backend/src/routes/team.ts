import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Team from '../models/Team';
import Race from '../models/Race';

const router = Router();
router.use(authMiddleware);

// GET /api/team/:raceId — get user's team for a race
router.get('/:raceId', async (req: AuthRequest, res: Response) => {
  const team = await Team.findOne({ userId: req.user!.userId, raceId: req.params.raceId });
  if (!team) return res.status(404).json({ error: 'No team found' });
  res.json(team);
});

// POST /api/team — create team for a race
// Body: { raceId, drivers: [id1, id2, id3], constructor: id, totalCost, mode }
router.post('/', async (req: AuthRequest, res: Response) => {
  const { raceId, drivers, constructor, totalCost, mode } = req.body;

  if (drivers.length !== 3) return res.status(400).json({ error: '3 drivers required' });
  if (totalCost > 60_000_000) return res.status(400).json({ error: 'Over cost cap' });

  const race = await Race.findById(raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });
  if (race.status !== 'upcoming') return res.status(400).json({ error: 'Race already started' });

  const existing = await Team.findOne({ userId: req.user!.userId, raceId });
  if (existing) return res.status(400).json({ error: 'Team already exists for this race' });

  const team = await Team.create({
    userId: req.user!.userId,
    raceId,
    drivers,
    constructorId: constructor,
    totalCost,
    mode: mode || 'free'
  });
  res.json(team);
});

// PUT /api/team/:raceId — update team (only if race is upcoming AND a driver is not racing)
router.put('/:raceId', async (req: AuthRequest, res: Response) => {
  const { drivers, constructor, totalCost, swappedDriverId, mode } = req.body;

  const race = await Race.findById(req.params.raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  // Swap only allowed if a driver is not racing (manual flag in race results or admin marks)
  if (race.status !== 'upcoming' && !swappedDriverId) {
    return res.status(400).json({ error: 'Team is locked. Swap only allowed for non-racing drivers.' });
  }

  if (totalCost > 60_000_000) return res.status(400).json({ error: 'Over cost cap' });

  const team = await Team.findOneAndUpdate(
    { userId: req.user!.userId, raceId: req.params.raceId },
    { drivers, constructorId: constructor, totalCost, mode: mode || 'free' },
    { new: true }
  );
  res.json(team);
});

export default router;