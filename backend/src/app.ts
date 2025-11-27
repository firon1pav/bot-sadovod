
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// --- PATCH: Fix BigInt serialization for Prisma ---
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();

import { authMiddleware } from './middleware/authMiddleware';
import { plantController } from './controllers/plantController';
import { userController } from './controllers/userController';
import { communityController } from './controllers/communityController';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors() as any);
app.use(express.json() as any);

// Serve uploaded files
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir) as any);

// Upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });


// --- ROUTES ---

// Helper to cast controller methods to RequestHandler
const asHandler = (fn: (req: any, res: any, next: NextFunction) => Promise<any> | any): any => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

app.use('/api', authMiddleware as any);

// Plants
app.get('/api/plants', asHandler(plantController.getAll));
app.get('/api/users/:userId/plants', asHandler(plantController.getByUserId));
app.post('/api/plants', upload.single('photo') as any, asHandler(plantController.create));
app.patch('/api/plants/:id', upload.single('photo') as any, asHandler(plantController.update));
app.delete('/api/plants/:id', asHandler(plantController.delete));
app.post('/api/plants/:id/care', asHandler(plantController.care));

// User & Social
app.get('/api/profile', asHandler(userController.getProfile));
app.put('/api/profile', upload.single('photo') as any, asHandler(userController.updateProfile));
app.get('/api/users/search', asHandler(userController.search));

// Friends & Requests
app.post('/api/friends/request', asHandler(userController.sendFriendRequest));
app.get('/api/friends/requests', asHandler(userController.getFriendRequests));
app.post('/api/friends/respond', asHandler(userController.respondToFriendRequest));
app.delete('/api/friends/:friendId', asHandler(userController.removeFriend));


// Communities
app.get('/api/communities', asHandler(communityController.getAll));
app.post('/api/communities', upload.single('photo') as any, asHandler(communityController.create));
app.post('/api/communities/:id/join', asHandler(communityController.join));
app.post('/api/communities/:id/leave', asHandler(communityController.leave));

// Posts
app.get('/api/communities/:id/posts', asHandler(communityController.getPosts));
app.post('/api/communities/:id/posts', upload.single('photo') as any, asHandler(communityController.createPost));
app.patch('/api/posts/:postId', upload.single('photo') as any, asHandler(communityController.updatePost));
app.delete('/api/posts/:postId', asHandler(communityController.deletePost));
app.post('/api/posts/:postId/like', asHandler(communityController.toggleLike));

// Comments
app.get('/api/posts/:postId/comments', asHandler(communityController.getComments));
app.post('/api/posts/:postId/comments', asHandler(communityController.addComment));

// AI
app.post('/api/ai/identify', upload.single('photo') as any, asHandler(plantController.identify));
app.post('/api/ai/diagnose', upload.single('photo') as any, asHandler(plantController.diagnose));
app.post('/api/ai/chat', asHandler(plantController.chat));

app.get('/health', (req, res) => { res.send('OK'); });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
