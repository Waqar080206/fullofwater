import { Router, Request, Response } from 'express';
import Race from '../models/Race';

const router = Router();

// GET /api/race — all races for current season
router.get('/', async (req: Request, res: Response) => {
  const season = new Date().getFullYear();
  const races = await Race.find({ season }).sort({ round: 1 });
  res.json(races);
});

// GET /api/race/:id — single race
router.get('/:id', async (req: Request, res: Response) => {
  const race = await Race.findById(req.params.id);
  if (!race) return res.status(404).json({ error: 'Race not found' });
  res.json(race);
});

export default router;