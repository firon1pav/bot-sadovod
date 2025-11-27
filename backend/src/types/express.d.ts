import * as express from 'express';

// Mocking Prisma Client types to fix missing generation errors
declare module '@prisma/client' {
  export interface User {
    id: string;
    telegramId: bigint;
    username: string | null;
    firstName: string | null;
    photoUrl: string | null;
    xp: number;
    level: number;
    friends: User[];
    following: User[];
    achievements: any[];
    communities: any[];
    plants: Plant[];
    careEvents: any[];
  }

  export interface Plant {
    id: string;
    userId: string;
    name: string;
    type: string;
    location: string;
    customLocation?: string | null;
    customType?: string | null;
    wateringFrequencyDays: number;
    lastWateredAt: Date;
    lastFertilizedAt: Date | null;
    nextFertilizingDate: Date | null;
    lastRepottedAt: Date | null;
    nextRepottingDate: Date | null;
    lastTrimmedAt: Date | null;
    nextTrimmingDate: Date | null;
    photoUrl: string;
    createdAt: Date;
  }
  
  export interface Community {
    id: string;
    name: string;
    description: string;
    photoUrl: string;
    members: any[];
  }
  
  export interface CommunityPost {
    id: string;
    communityId: string;
    authorId: string;
    text: string;
    photoUrl: string | null;
    createdAt: Date;
    likes: number;
    comments: number;
    author: User;
  }
  
  export interface Comment {
      id: string;
      postId: string;
      authorId: string;
      text: string;
      createdAt: Date;
      author: User;
  }
  
  export interface CareEvent {
      id: string;
      userId: string;
      plantId: string;
      type: string;
      note?: string | null;
      photoUrl?: string | null;
      occurredAt: Date;
  }

  export enum CareType {
    WATER = 'WATER',
    TRIM = 'TRIM',
    REPOT = 'REPOT',
    FERTILIZE = 'FERTILIZE'
  }

  export class PrismaClient {
    user: any;
    plant: any;
    careEvent: any;
    achievement: any;
    userAchievement: any;
    community: any;
    communityMember: any;
    post: any;
    postLike: any;
    comment: any;
    friendRequest: any;
    $transaction(args: any[]): Promise<any>;
    $disconnect(): Promise<void>;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      file?: any;
      files?: any;
    }
  }
}