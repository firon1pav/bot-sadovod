
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// В продакшене эту функцию нужно использовать для проверки подписи
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
    
    // ДЛЯ РАЗРАБОТКИ (пока нет реального токена):
    // Если заголовка нет, используем тестового пользователя
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

    // В реальном приложении раскомментировать проверку:
    // if (!verifyTelegramWebAppData(authHeader)) {
    //    return res.status(403).json({ error: 'Invalid Telegram data' });
    // }

    // Парсим данные из initData (это строка query params)
    const params = new URLSearchParams(authHeader);
    const userStr = params.get('user');
    
    if (!userStr) {
        return res.status(400).json({ error: 'No user data found' });
    }

    const telegramUser = JSON.parse(userStr);
    
    // Upsert пользователя (найти или создать/обновить)
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
