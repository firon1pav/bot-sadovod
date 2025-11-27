
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

export const communityController = {
  // Get all communities with optional search
  async getAll(req: any, res: any) {
    const { query } = req.query;
    
    const whereClause = query ? {
        OR: [
            { name: { contains: String(query), mode: 'insensitive' } },
            { description: { contains: String(query), mode: 'insensitive' } }
        ]
    } : {};

    const communities = await prisma.community.findMany({
      where: whereClause as any,
      include: {
        _count: { select: { members: true } }
      }
    });

    // Check membership
    const myMemberships = await prisma.communityMember.findMany({
      where: { userId: req.user!.id }
    });
    const myCommunityIds = new Set(myMemberships.map((m: any) => m.communityId));

    const result = communities.map((c: any) => ({
      ...c,
      memberCount: c._count.members,
      isMember: myCommunityIds.has(c.id)
    }));

    res.json(result);
  },

  // Create community
  async create(req: any, res: any) {
    const { name, description } = req.body;
    const file = req.file;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoUrl = file ? `${baseUrl}/uploads/${file.filename}` : 'https://placehold.co/400';

    const community = await prisma.community.create({
      data: {
        name,
        description,
        photoUrl: photoUrl,
        members: {
            create: { userId: req.user!.id }
        }
      }
    });

    res.json({ ...community, memberCount: 1, isMember: true });
  },

  // Join
  async join(req: any, res: any) {
    const { id } = req.params;
    
    const existing = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: id, userId: req.user!.id } }
    });

    if (!existing) {
        await prisma.communityMember.create({
            data: {
                communityId: id,
                userId: req.user!.id
            }
        });
    }
    res.json({ success: true });
  },

  // Leave
  async leave(req: any, res: any) {
    const { id } = req.params;
    await prisma.communityMember.deleteMany({
        where: {
            communityId: id,
            userId: req.user!.id
        }
    });
    res.json({ success: true });
  },

  // Get posts
  async getPosts(req: any, res: any) {
    const { id } = req.params;
    const posts = await prisma.post.findMany({
        where: { communityId: id },
        include: {
            author: { select: { id: true, firstName: true, photoUrl: true } },
            _count: { select: { comments: true, likes: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    const myLikes = await prisma.postLike.findMany({
        where: { userId: req.user!.id, postId: { in: posts.map((p: any) => p.id) } }
    });
    const myLikedIds = new Set(myLikes.map((l: any) => l.postId));

    const result = posts.map((p: any) => ({
        ...p,
        authorName: p.author.firstName,
        authorPhotoUrl: p.author.photoUrl,
        likes: p._count.likes,
        comments: p._count.comments,
        isLiked: myLikedIds.has(p.id)
    }));

    res.json(result);
  },

  // Create post
  async createPost(req: any, res: any) {
      const { id } = req.params;
      const { text } = req.body;
      const file = req.file;

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const photoUrl = file ? `${baseUrl}/uploads/${file.filename}` : null;

      const post = await prisma.post.create({
          data: {
              communityId: id,
              authorId: req.user!.id,
              text,
              photoUrl: photoUrl
          },
          include: {
              author: { select: { id: true, firstName: true, photoUrl: true } }
          }
      });
      
      res.json({
          ...post,
          authorName: post.author.firstName,
          authorPhotoUrl: post.author.photoUrl,
          likes: 0,
          comments: 0
      });
  },

  // Update Post
  async updatePost(req: any, res: any) {
      const { postId } = req.params;
      const { text } = req.body;
      const file = req.file;

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.authorId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });

      const updates: any = { text };
      if (file) {
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          updates.photoUrl = `${baseUrl}/uploads/${file.filename}`;
      }

      const updated = await prisma.post.update({
          where: { id: postId },
          data: updates,
          include: { author: { select: { id: true, firstName: true, photoUrl: true } } }
      });

      res.json({
          ...updated,
          authorName: updated.author.firstName,
          authorPhotoUrl: updated.author.photoUrl
      });
  },

  // Delete post
  async deletePost(req: any, res: any) {
      const { postId } = req.params;
      
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return res.status(404).json({ error: "Post not found" });
      
      if (post.authorId !== req.user!.id) {
          return res.status(403).json({ error: "Not authorized to delete this post" });
      }

      await prisma.post.delete({ where: { id: postId } });
      res.json({ success: true });
  },

  // Toggle Like
  async toggleLike(req: any, res: any) {
      const { postId } = req.params;
      const userId = req.user!.id;

      const existingLike = await prisma.postLike.findUnique({
          where: { postId_userId: { postId, userId } }
      });

      if (existingLike) {
          await prisma.postLike.delete({
              where: { postId_userId: { postId, userId } }
          });
          res.json({ liked: false });
      } else {
          await prisma.postLike.create({
              data: { postId, userId }
          });
          res.json({ liked: true });
      }
  },

  // Comments
  async getComments(req: any, res: any) {
      const { postId } = req.params;
      const comments = await prisma.comment.findMany({
          where: { postId },
          include: { author: { select: { id: true, firstName: true, photoUrl: true } } },
          orderBy: { createdAt: 'asc' }
      });
      res.json(comments.map((c: any) => ({
          ...c,
          authorName: c.author.firstName,
          authorPhotoUrl: c.author.photoUrl
      })));
  },

  async addComment(req: any, res: any) {
      const { postId } = req.params;
      const { text } = req.body;
      const comment = await prisma.comment.create({
          data: {
              postId,
              authorId: req.user!.id,
              text
          },
          include: {
              author: { select: { id: true, firstName: true, photoUrl: true } }
          }
      });
      res.json({
          ...comment,
          authorName: comment.author.firstName,
          authorPhotoUrl: comment.author.photoUrl
      });
  }
};
