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
  streakWater: number;
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
    icon: string;
    rarity: AchievementRarity;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    earnedAt: Date;
}