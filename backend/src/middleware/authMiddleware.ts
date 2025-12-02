
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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
    // If no header and in development, create/use a dev user.
    if (!authHeader && process.env.NODE_ENV === 'development') {
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

    // PRODUCTION SECURITY CHECK
    // Strictly verify the data signature to prevent spoofing
    if (process.env.NODE_ENV === 'production') {
        const isValid = verifyTelegramWebAppData(authHeader);
        if (!isValid) {
           console.warn("Invalid Telegram InitData signature");
           return res.status(403).json({ error: 'Invalid Telegram data' });
        }
    }

    // Parse data from initData (query params string)
    const params = new URLSearchParams(authHeader);
    const userStr = params.get('user');
    
    if (!userStr) {
        return res.status(400).json({ error: 'No user data found' });
    }

    const telegramUser = JSON.parse(userStr);
    
    // Upsert User
    const user = await prisma.user.upsert({
        where: { telegramId: BigInt(telegramUser.id) },
        update: {
            username: telegramUser.username,
            firstName: telegramUser.first_name,
            photoUrl: telegramUser.photo_url
        },
        create: {
            telegramId: BigInt(telegramUser.id),
            username: telegramUser.username,
            firstName: telegramUser.first_name,
            photoUrl: telegramUser.photo_url
        }
    });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
