
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from './middleware/rateLimitMiddleware';
import { prisma } from './db';

// --- PATCH: Fix BigInt serialization for Prisma ---
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();

import { authMiddleware } from './middleware/authMiddleware';
import { plantController } from './controllers/plantController';
import { userController } from './controllers/userController';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // Important for Rate Limiting behind Nginx/Proxies

// --- SECURITY & PERFORMANCE MIDDLEWARE ---
app.use(helmet()); // Sets various HTTP headers for security
app.use(compression()); // Compresses response bodies
app.use(cors() as any);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '1mb' }) as any); // Limit JSON body size to prevent DoS

// Serve uploaded files
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
// Serve static files safely
app.use('/uploads', express.static(uploadDir) as any);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

// SECURITY FIX: Add fileFilter to allow only images
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

const asHandler = (fn: (req: any, res: any, next: NextFunction) => Promise<any> | any): any => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

// FIX: Auth must run BEFORE Rate Limit for user-based limiting to work
app.use('/api', authMiddleware as any);
app.use('/api', apiLimiter as any);

// Plants
app.get('/api/plants', asHandler(plantController.getAll));
app.post('/api/plants', upload.single('photo') as any, asHandler(plantController.create));
app.patch('/api/plants/:id', upload.single('photo') as any, asHandler(plantController.update));
app.delete('/api/plants/:id', asHandler(plantController.delete));
app.post('/api/plants/:id/care', asHandler(plantController.care));
app.get('/api/plants/:id/timelapse', asHandler(plantController.getTimelapse)); 

// Market/Swap
app.get('/api/market', asHandler(plantController.getMarket)); 

// Weather
app.post('/api/weather/check', asHandler(plantController.checkWeather));

// User & Social
app.get('/api/profile', asHandler(userController.getProfile));
app.put('/api/profile', upload.single('photo') as any, asHandler(userController.updateProfile));
app.delete('/api/profile', asHandler(userController.deleteAccount));
app.get('/api/users/search', asHandler(userController.search));
app.get('/api/users/:id', asHandler(userController.getUserById));
app.post('/api/quests/:id/complete', asHandler(userController.completeQuest));

// Friends
app.post('/api/friends/request', asHandler(userController.sendFriendRequest));
app.get('/api/friends/requests', asHandler(userController.getFriendRequests));
app.post('/api/friends/respond', asHandler(userController.respondToFriendRequest));
app.delete('/api/friends/:friendId', asHandler(userController.removeFriend));

// AI
app.post('/api/ai/identify', aiLimiter as any, upload.single('photo') as any, asHandler(plantController.identify));
app.post('/api/ai/diagnose', aiLimiter as any, upload.single('photo') as any, asHandler(plantController.diagnose));
app.post('/api/ai/chat', aiLimiter as any, asHandler(plantController.chat));

app.get('/health', async (req, res) => { res.status(200).send('OK'); });

// GLOBAL ERROR HANDLER (Last middleware)
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
