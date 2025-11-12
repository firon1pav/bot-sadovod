// FIX: Import React to use React.ReactNode type for Notification icon.
import React from 'react';

// FIX: Removed self-import of types from this file, which caused declaration conflicts.

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

export interface Stats {
  userId: string;
  totalWaterings: number;
  totalFertilizes: number;
  totalRepots: number;
  totalTrims: number;
  streakWater: number;
  totalActions: number;
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

export interface User {
    id: string;
    name: string;
    photoUrl: string;
    gender: 'male' | 'female';
    age: number;
    telegramUsername?: string;
    about: string;
    friends: Friend[];
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