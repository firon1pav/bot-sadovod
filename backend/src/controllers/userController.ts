
import { Request, Response } from 'express';
import { prisma } from '../db';
import path from 'path';
import fs from 'fs';
import { careService } from '../services/careService';
import { questService } from '../services/questService';

// Helper to delete file from uploads
const deleteFile = (fileUrl: string) => {
    if (!fileUrl) return;
    try {
        const urlParts = fileUrl.split('/');
        // SECURITY FIX: Use path.basename to prevent Path Traversal attacks
        const filename = path.basename(urlParts[urlParts.length - 1]);
        
        if (!filename) return;
        const filePath = path.resolve('uploads', filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Failed to delete file: ${filePath}`, err);
            });
        }
    } catch (e) {
        console.error("Error deleting file:", e);
    }
};

// Helper to delete local file (from req.file.path)
const deleteLocalFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
    }
};

export const userController = {
  // Get current user profile (optimized: no stats/history, adds Quests)
  async getProfile(req: any, res: any) {
    const userId = req.user!.id;
    
    // Ensure daily quests exist
    await questService.getDailyQuests(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: { select: { id: true, firstName: true, photoUrl: true, username: true } },
        achievements: { include: { achievement: true } },
        communities: { include: { community: true } },
        plants: true,
        dailyQuests: {
            where: { date: new Date().toISOString().split('T')[0] }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const friends = ((user as any).following || []).map((f: any) => ({
        ...f,
        name: f.firstName || f.username || 'Friend'
    }));

    res.json({ 
        ...user, 
        name: user.firstName || user.username || 'User',
        friends
    });
  },

  // Complete Quest
  async completeQuest(req: any, res: any) {
      const { id } = req.params;
      try {
          const result = await questService.completeQuest(req.user!.id, id);
          res.json(result);
      } catch (e: any) {
          res.status(400).json({ error: e.message });
      }
  },

  // Get specific user by ID (Public Profile)
  async getUserById(req: any, res: any) {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
          where: { id },
          select: {
              id: true,
              firstName: true,
              username: true,
              photoUrl: true,
              about: true,
              gender: true,
              age: true,
              level: true,
              xp: true,
          }
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      // Check Helpful Neighbor achievement
      if (req.user && req.user.id !== id) {
          await careService.unlockAchievement(req.user.id, 'HELPFUL_NEIGHBOR');
      }

      res.json({
          ...user,
          name: user.firstName || user.username || 'User',
      });
  },

  // Update profile
  async updateProfile(req: any, res: any) {
    const { name, about, gender, age, telegramUsername } = req.body;
    const file = req.file;
    
    const updates: any = {};
    if (about !== undefined) updates.about = String(about).substring(0, 500); // Limit length
    if (gender !== undefined) updates.gender = gender;
    if (telegramUsername !== undefined) updates.username = telegramUsername;

    if (age !== undefined) {
        const ageNum = Number(age);
        if (!isNaN(ageNum) && ageNum >= 0 && ageNum < 150) {
            updates.age = ageNum;
        }
    }

    // Map 'name' from frontend to 'firstName' in DB
    if (name) {
        updates.firstName = String(name).substring(0, 100);
    }

    // Handle File Upload
    if (file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        updates.photoUrl = `${baseUrl}/uploads/${file.filename}`;
    }
    
    try {
        const userBeforeUpdate = await prisma.user.findUnique({ where: { id: req.user!.id } });

        const updatedUser = await prisma.user.update({
          where: { id: req.user!.id },
          data: updates,
          include: {
              following: { select: { id: true, firstName: true, photoUrl: true, username: true } } // Fixed: 'friends' -> 'following'
          }
        });

        // Cleanup old photo ONLY if DB update succeeded
        if (file && userBeforeUpdate?.photoUrl) {
            deleteFile(userBeforeUpdate.photoUrl);
        }

        // Return mapped object
        res.json({
            ...updatedUser,
            name: updatedUser.firstName || updatedUser.username || 'User',
            friends: ((updatedUser as any).following || []).map((f: any) => ({ ...f, name: f.firstName || f.username }))
        });
    } catch (e: any) {
        // Cleanup uploaded file if DB update failed
        if (file) {
            deleteLocalFile(file.path);
        }

        // Handle Unique Constraint Violation (P2002) usually on 'username'
        if (e.code === 'P2002') {
            return res.status(400).json({ error: "Username already taken" });
        }
        console.error("Update profile error", e);
        res.status(500).json({ error: "Failed to update profile" });
    }
  },

  // Delete Account
  async deleteAccount(req: any, res: any) {
      const userId = req.user!.id;

      try {
          // ORPHANED FILES FIX: 
          // 1. Get all file URLs associated with user before deletion
          const user = await prisma.user.findUnique({
              where: { id: userId },
              include: { plants: true }
          });

          if (user) {
              // Delete Profile Photo
              if (user.photoUrl) deleteFile(user.photoUrl);
              
              // Delete Plant Photos
              if (user.plants) {
                  user.plants.forEach((plant: any) => {
                      if (plant.photoUrl) deleteFile(plant.photoUrl);
                  });
              }
          }

          // 2. Perform DB deletion (Cascades should handle relations, or delete manually if needed)
          await prisma.$transaction([
              prisma.careEvent.deleteMany({ where: { userId } }),
              prisma.plant.deleteMany({ where: { userId } }),
              prisma.friendRequest.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
              prisma.userAchievement.deleteMany({ where: { userId } }),
              prisma.dailyQuest.deleteMany({ where: { userId } }),
              // Finally delete user
              prisma.user.delete({ where: { id: userId } })
          ]);

          res.json({ success: true, message: "Account and data deleted" });
      } catch (e) {
          console.error("Delete Account Error:", e);
          res.status(500).json({ error: "Failed to delete account" });
      }
  },

  // Friend Request Handlers
  async sendFriendRequest(req: any, res: any) {
    const { friendId } = req.body;
    const userId = req.user!.id;
    if (friendId === userId) return res.status(400).json({ error: "Cannot add yourself" });

    // SECURITY / ANTI-SPAM: Check pending requests count
    const pendingCount = await prisma.friendRequest.count({
        where: { senderId: userId, status: 'PENDING' }
    });

    if (pendingCount >= 20) {
        return res.status(429).json({ error: "Too many pending requests. Wait for responses." });
    }

    const existingReq = await prisma.friendRequest.findFirst({
        where: {
            OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId } 
            ],
            status: { in: ['PENDING', 'REJECTED'] }
        }
    });

    if (existingReq) return res.status(400).json({ error: "Request exists" });

    await prisma.friendRequest.create({
        data: { senderId: userId, receiverId: friendId, status: 'PENDING' }
    });

    res.json({ success: true });
  },

  async getFriendRequests(req: any, res: any) {
    const requests = await prisma.friendRequest.findMany({
        where: { receiverId: req.user!.id, status: 'PENDING' },
        include: { sender: { select: { id: true, firstName: true, photoUrl: true, username: true } } }
    });
    const users = requests.map((r: any) => ({
        ...r.sender,
        name: r.sender.firstName || r.sender.username,
        requestId: r.id
    }));
    res.json(users);
  },

  async respondToFriendRequest(req: any, res: any) {
      const { requestId, action } = req.body;
      const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
      if (!request) return res.status(404).json({ error: "Request not found" });

      if (action === 'ACCEPT') {
          await prisma.$transaction(async (tx) => {
              await tx.friendRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } });
              await tx.user.update({ where: { id: request.senderId }, data: { following: { connect: { id: request.receiverId } } } });
              await tx.user.update({ where: { id: request.receiverId }, data: { following: { connect: { id: request.senderId } } } });
              
              // Unlock FIRST_FRIEND
              await careService.unlockAchievement(request.senderId, 'FIRST_FRIEND', tx);
              await careService.unlockAchievement(request.receiverId, 'FIRST_FRIEND', tx);

              // Check POPULAR (5 Friends)
              const senderFriends = await tx.user.findUnique({ where: { id: request.senderId }, include: { following: true } });
              if (senderFriends?.following.length >= 5) await careService.unlockAchievement(request.senderId, 'POPULAR', tx);

              const receiverFriends = await tx.user.findUnique({ where: { id: request.receiverId }, include: { following: true } });
              if (receiverFriends?.following.length >= 5) await careService.unlockAchievement(request.receiverId, 'POPULAR', tx);
          });
          res.json({ success: true });
      } else {
          await prisma.friendRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } });
          res.json({ success: true });
      }
  },

  async removeFriend(req: any, res: any) {
    const { friendId } = req.params;
    await prisma.user.update({ where: { id: req.user!.id }, data: { following: { disconnect: { id: friendId } } } });
    await prisma.user.update({ where: { id: friendId }, data: { following: { disconnect: { id: req.user!.id } } } });
    res.json({ success: true });
  },

  async search(req: any, res: any) {
    const { query } = req.query;
    // PERFORMANCE FIX: Require minimum 3 chars to prevent heavy DB load on 'a', 'b', etc.
    if (!query || String(query).length < 3) return res.json([]);
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
            { username: { contains: String(query), mode: 'insensitive' } },
            { firstName: { contains: String(query), mode: 'insensitive' } }
        ],
        id: { not: req.user!.id }
      },
      take: 10,
      select: { id: true, firstName: true, username: true, photoUrl: true }
    });
    const result = users.map((u: any) => ({ ...u, name: u.firstName || u.username }));
    res.json(result);
  }
};
