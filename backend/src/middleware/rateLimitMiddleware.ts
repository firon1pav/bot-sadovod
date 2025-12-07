
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime <= now) {
      delete store[key];
    }
  }
}, 10 * 60 * 1000);

export const rateLimit = (options: { windowMs: number; max: number; message?: string }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // FIX: Use User ID if authenticated to prevent IP blocking behind NAT/Proxies
    // req.user is set by authMiddleware which should run BEFORE this for API routes
    const key = (req as any).user?.id || (req as any).ip || 'unknown'; 
    const now = Date.now();

    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + options.windowMs,
      };
    }

    const record = store[key];

    // Reset if window passed
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + options.windowMs;
    }

    record.count++;

    if (record.count > options.max) {
        console.warn(`Rate limit exceeded for: ${key}`);
        return (res as any).status(429).json({ 
            error: options.message || 'Too many requests, please try again later.' 
        });
    }

    next();
  };
};
