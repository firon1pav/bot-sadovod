
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userController = {
  // Get current user profile with stats
  async getProfile(req: any, res: any) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        friends: { select: { id: true, firstName: true, photoUrl: true, username: true } }, // Actually 'following' in Prisma terms, but treated as friends here
        achievements: { include: { achievement: true } },
        communities: { include: { community: true } },
        plants: true,
        careEvents: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate stats on the fly
    const stats = {
      userId: user.id,
      totalWaterings: user.careEvents.filter((e: any) => e.type === 'WATER').length,
      totalFertilizes: user.careEvents.filter((e: any) => e.type === 'FERTILIZE').length,
      totalRepots: user.careEvents.filter((e: any) => e.type === 'REPOT').length,
      totalTrims: user.careEvents.filter((e: any) => e.type === 'TRIM').length,
      totalActions: user.careEvents.length,
      streakWater: 0 // logic for streak can be added later
    };

    // Map 'following' to 'friends' and 'firstName' to 'name' for frontend compatibility
    const friends = ((user as any).following || []).map((f: any) => ({
        ...f,
        name: f.firstName || f.username || 'Friend'
    }));

    res.json({ 
        ...user, 
        name: user.firstName || user.username || 'User', // Frontend expects 'name'
        friends, 
        stats 
    });
  },

  // Update profile
  async updateProfile(req: any, res: any) {
    const { name, about, gender, age, telegramUsername } = req.body;
    const file = req.file;
    
    const updates: any = {};
    if (about !== undefined) updates.about = about;
    if (gender !== undefined) updates.gender = gender;
    if (age !== undefined) updates.age = Number(age);
    if (telegramUsername !== undefined) updates.username = telegramUsername;

    // Map 'name' from frontend to 'firstName' in DB
    if (name) {
        updates.firstName = name;
    }

    // Handle File Upload
    if (file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        updates.photoUrl = `${baseUrl}/uploads/${file.filename}`;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: updates,
      include: {
          friends: { select: { id: true, firstName: true, photoUrl: true, username: true } }
      }
    });

    // Return mapped object
    res.json({
        ...updatedUser,
        name: updatedUser.firstName || updatedUser.username || 'User',
        friends: ((updatedUser as any).following || []).map((f: any) => ({ ...f, name: f.firstName || f.username }))
    });
  },

  // --- Friend Request Logic ---

  // 1. Send Friend Request
  async sendFriendRequest(req: any, res: any) {
    const { friendId } = req.body;
    const userId = req.user!.id;

    if (friendId === userId) {
        return res.status(400).json({ error: "Cannot add yourself" });
    }

    // Check if already friends
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { following: { where: { id: friendId } } }
    });

    if (user?.following && user.following.length > 0) {
        return res.status(400).json({ error: "Already friends" });
    }

    // Check if request already exists
    const existingReq = await prisma.friendRequest.findFirst({
        where: {
            OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId } // Check reverse to prevent duplicates
            ],
            status: 'PENDING'
        }
    });

    if (existingReq) {
        return res.status(400).json({ error: "Request already pending" });
    }

    await prisma.friendRequest.create({
        data: {
            senderId: userId,
            receiverId: friendId,
            status: 'PENDING'
        }
    });

    res.json({ success: true, message: "Friend request sent" });
  },

  // 2. Get Pending Requests (Received)
  async getFriendRequests(req: any, res: any) {
    const requests = await prisma.friendRequest.findMany({
        where: {
            receiverId: req.user!.id,
            status: 'PENDING'
        },
        include: {
            sender: { select: { id: true, firstName: true, photoUrl: true, username: true } }
        }
    });

    // Map to simple User structure for frontend
    const users = requests.map((r: any) => ({
        ...r.sender,
        name: r.sender.firstName || r.sender.username, // Map name
        requestId: r.id // attach request ID for action
    }));

    res.json(users);
  },

  // 3. Respond to Request (Accept/Reject)
  async respondToFriendRequest(req: any, res: any) {
      const { requestId, action } = req.body; // action: 'ACCEPT' | 'REJECT'
      
      const request = await prisma.friendRequest.findUnique({
          where: { id: requestId }
      });

      if (!request || request.receiverId !== req.user!.id || request.status !== 'PENDING') {
          return res.status(404).json({ error: "Request not found or invalid" });
      }

      if (action === 'ACCEPT') {
          // Transaction: Update request status AND create mutual following
          await prisma.$transaction([
              prisma.friendRequest.update({
                  where: { id: requestId },
                  data: { status: 'ACCEPTED' }
              }),
              prisma.user.update({
                  where: { id: request.senderId },
                  data: { following: { connect: { id: request.receiverId } } }
              }),
              prisma.user.update({
                  where: { id: request.receiverId },
                  data: { following: { connect: { id: request.senderId } } }
              })
          ]);
          res.json({ success: true, message: "Friend added" });

      } else {
          // Reject
          await prisma.friendRequest.update({
              where: { id: requestId },
              data: { status: 'REJECTED' }
          });
          res.json({ success: true, message: "Request rejected" });
      }
  },

  // 4. Remove friend (Mutual disconnect)
  async removeFriend(req: any, res: any) {
    const { friendId } = req.params;
    const userId = req.user!.id;

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { following: { disconnect: { id: friendId } } }
        }),
        prisma.user.update({
            where: { id: friendId },
            data: { following: { disconnect: { id: userId } } }
        })
    ]);

    // Also remove any friend requests between them to be clean
    await prisma.friendRequest.deleteMany({
        where: {
            OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ]
        }
    });

    res.json({ success: true });
  },

  // Search users
  async search(req: any, res: any) {
    const { query } = req.query;
    if (!query) return res.json([]);

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

    const result = users.map((u: any) => ({
        ...u,
        name: u.firstName || u.username
    }));

    res.json(result);
  }
};
