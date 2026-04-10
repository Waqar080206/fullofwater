import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const adminWallet = process.env.ADMIN_WALLET?.toLowerCase();
  if (req.user?.walletAddress?.toLowerCase() !== adminWallet) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}