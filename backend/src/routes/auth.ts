import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// GET /api/auth/nonce/:address
// Returns a nonce message the wallet must sign
router.get('/nonce/:address', async (req: Request, res: Response) => {
  const address = req.params.address.toLowerCase();
  const nonce = `Sign this message to login to OffGrid Fantasy.\nWallet: ${address}\nNonce: ${Date.now()}`;
  res.json({ nonce });
});

// POST /api/auth/verify
// Body: { address, signature, nonce, username? }
// Verifies signature, creates user if new, returns JWT
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { address, signature, nonce, username } = req.body;
    const recoveredAddress = ethers.verifyMessage(nonce, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      user = await User.create({
        walletAddress: address.toLowerCase(),
        username: username || `Racer_${address.slice(2, 8)}`,
      });
    }

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Auth failed' });
  }
});

export default router;