
// FIX: Import React to use React.ReactNode type for Notification icon.
import React from 'react';

export enum PlantLocation {
  HOME = 'HOME',
  BALCONY = 'BALCONY',
  OFFICE = 'OFFICE',
  GARDEN = 'GARDEN',
  OTHER = 'OTHER',
}

export enum PlantType {
  FOLIAGE = 'FOLIAGE',
  FLOWERING = 'FLOWERING',
  SUCCULENT = 'SUCCULENT',
  PALM = 'PALM',
  OTHER = 'OTHER',
}

export enum CareType {
  WATER = 'WATER',
  TRIM = 'TRIM',
  REPOT = 'REPOT',
  FERTILIZE = 'FERTILIZE',
}

export interface Plant {
  id: string;
  userId: string;
  name: string;
  photoUrl: string;
  location: PlantLocation;
  customLocation?: string;
  type: PlantType;
  customType?: string;
  lastWateredAt: Date;
  createdAt: Date;
  wateringFrequencyDays: number;
  
  lastFertilizedAt?: Date;
  nextFertilizingDate?: Date;

  lastRepottedAt?: Date;
  nextRepottingDate?: Date;

  lastTrimmedAt?: Date;
  nextTrimmingDate?: Date;

  // Market features
  isForSale?: boolean;
  price?: number;
  currency?: string;
  city?: string;
  description?: string;
  sellerTelegram?: string;
  sellerName?: string;
  sellerPhotoUrl?: string;

  // Legacy / Additional features
  isSwapAvailable?: boolean;
  isGiveaway?: boolean;
}

export interface CareEvent {
  id: string;
  userId: string;
  plantId: string;
  type: CareType;
  note?: string;
  photoUrl?: string;
  occurredAt: Date;
  createdAt: Date;
}

export interface LevelProgress {
  userId: string;
  xp: number;
  level: number;
}

export interface LevelInfo extends LevelProgress {
  levelName: string;
  levelIcon: string;
  nextLevelXp: number;
  progressPercentage: number;
}

export enum AchievementRarity {
    COMMON = 'COMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
}

export interface Achievement {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    rarity: AchievementRarity;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    earnedAt: Date;
}

export interface Friend {
    id: string;
    name: string;
    photoUrl: string;
}

export interface DailyQuest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    isCompleted: boolean;
}

export interface User {
    id: string;
    name: string;
    photoUrl: string;
    gender: 'male' | 'female';
    age: number;
    telegramUsername?: string;
    about: string;
    friends: Friend[];
    requestId?: string;
    xp?: number;
    level?: number;
    dailyQuests?: DailyQuest[];
    
    // AI Limit fields (Monthly limit 5)
    aiRequestsCount: number;
    aiLastResetDate?: Date;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    photoUrl: string;
    memberCount: number;
    isMember: boolean;
}

export interface CommunityPost {
    id: string;
    communityId: string;
    authorId: string;
    authorName: string;
    authorPhotoUrl: string;
    text: string;
    photoUrl?: string;
    createdAt: Date;
    likes: number;
    comments: number;
    isLiked?: boolean;
}

export interface CommunityMember {
    id: string;
    communityId: string;
    userId: string;
    name: string;
    photoUrl: string;
    joinedAt: Date;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorPhotoUrl: string;
    text: string;
    createdAt: Date;
}

export interface Notification {
  id: string;
  message: string;
  icon: React.ReactNode;
}
