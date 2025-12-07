
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../db';

// Validate Telegram Web App Init Data
const verifyTelegramWebAppData = (telegramInitData: string): boolean => {
  const token = process.env.BOT_TOKEN;
  if (!token) return false;

  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get("hash");
  const dataToCheck: string[] = [];

  initData.sort();
  initData.forEach((val, key) => {
      if (key !== "hash") {
          dataToCheck.push(`${key}=${val}`);
      }
  });

  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const _hash = crypto.createHmac("sha256", secret).update(dataToCheck.join("\n")).digest("hex");

  return _hash === hash;
};

export const authMiddleware = async (req: any, res: any, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // DEVELOPMENT MODE BYPASS
    // SECURITY FIX: Require explicit ENABLE_UNSAFE_DEV_AUTH flag to prevent accidental backdoor in production
    if (!authHeader && process.env.NODE_ENV === 'development' && process.env.ENABLE_UNSAFE_DEV_AUTH === 'true') {
        let devUser = await prisma.user.findFirst({ where: { username: 'dev_user' } });
        if (!devUser) {
            devUser = await prisma.user.create({
                data: { telegramId: BigInt(123456), username: 'dev_user', firstName: 'Developer' }
            });
        }
        req.user = devUser;
        return next();
    }

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Parse data from initData (query params string)
    const params = new URLSearchParams(authHeader);
    const userStr = params.get('user');
    const authDateStr = params.get('auth_date');
    
    if (!userStr) {
        return res.status(400).json({ error: 'No user data found' });
    }

    // PRODUCTION SECURITY CHECK
    if (process.env.NODE_ENV === 'production') {
        // 1. Signature Check
        const isValid = verifyTelegramWebAppData(authHeader);
        if (!isValid) {
           console.warn("Invalid Telegram InitData signature");
           return res.status(403).json({ error: 'Invalid Telegram data' });
        }

        // 2. Freshness Check (Replay Attack Protection)
        // auth_date is a unix timestamp (seconds)
        if (authDateStr) {
            const authDate = parseInt(authDateStr, 10);
            const now = Math.floor(Date.now() / 1000);
            const timeDiff = now - authDate;
            
            // Allow 24 hours (86400 seconds) discrepancy
            if (timeDiff > 86400) {
                console.warn("Telegram InitData expired");
                return res.status(403).json({ error: 'Session expired. Please reload the app.' });
            }
        }
    }

    const telegramUser = JSON.parse(userStr);
    const telegramId = BigInt(telegramUser.id);
    
    // OPTIMIZATION: Read first to avoid heavy write operations (upsert) on every request
    let user = await prisma.user.findUnique({
        where: { telegramId }
    });

    if (!user) {
        // Create new user
        user = await prisma.user.create({
            data: {
                telegramId,
                username: telegramUser.username,
                firstName: telegramUser.first_name,
                photoUrl: telegramUser.photo_url
            }
        });
    } else {
        // PERFORMANCE FIX: Only update DB if critical data actually changed
        const hasChanged = 
            user.username !== telegramUser.username || 
            user.firstName !== telegramUser.first_name ||
            (telegramUser.photo_url && user.photoUrl !== telegramUser.photo_url);

        if (hasChanged) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    username: telegramUser.username,
                    firstName: telegramUser.first_name,
                    photoUrl: telegramUser.photo_url
                }
            });
        }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
