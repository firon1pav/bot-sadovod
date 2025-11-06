import { useState, useCallback, useMemo } from 'react';
import {
  Plant,
  CareEvent,
  CareType,
  Stats,
  LevelInfo,
  Achievement,
  UserAchievement,
  PlantLocation,
  PlantType,
  AchievementRarity,
} from '../types';
import { CARE_XP_REWARDS, DEFAULT_WATERING_FREQUENCY, XP_LEVELS } from '../constants';

// Simple uuid v4 mock, as we can't add new dependencies.
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// --- MOCK DATA ---

const initialUser = {
  id: 'user1',
  name: 'Анна',
  photoUrl: 'https://i.pravatar.cc/150?u=user1',
};

const initialPlants: Plant[] = [
  {
    id: 'plant1',
    userId: 'user1',
    name: 'Монстера',
    photoUrl: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    location: PlantLocation.HOME,
    type: PlantType.FOLIAGE,
    lastWateredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    wateringFrequencyDays: 5,
    lastFertilizedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextFertilizingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'plant2',
    userId: 'user1',
    name: 'Фикус',
    photoUrl: 'https://images.unsplash.com/photo-1614594975525-e4d524c4d697?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    location: PlantLocation.OFFICE,
    type: PlantType.FOLIAGE,
    lastWateredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    wateringFrequencyDays: 7,
  },
  {
    id: 'plant3',
    userId: 'user1',
    name: 'Суккулент',
    photoUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    location: PlantLocation.HOME,
    type: PlantType.SUCCULENT,
    lastWateredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    wateringFrequencyDays: 14,
    nextRepottingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
];

const initialCareEvents: CareEvent[] = [
  {
    id: 'event1',
    userId: 'user1',
    plantId: 'plant1',
    type: CareType.WATER,
    occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
];

const initialStats: Stats = {
  userId: 'user1',
  totalWaterings: 12,
  streakWater: 3,
};

const allAchievements: Achievement[] = [
    { id: 'ach1', code: 'FIRST_PLANT', name: 'Начинающий садовод', description: 'Добавить первое растение', icon: '🌱', rarity: AchievementRarity.COMMON },
    { id: 'ach2', code: 'FIVE_PLANTS', name: 'Коллекционер', description: 'Вырастить 5 растений', icon: '🪴', rarity: AchievementRarity.RARE },
    { id: 'ach3', code: 'FIRST_WATER', name: 'Первая капля', description: 'Полить растение в первый раз', icon: '💧', rarity: AchievementRarity.COMMON },
    { id: 'ach4', code: 'STREAK_7', name: 'Точность', description: 'Серия поливов в 7 дней', icon: '🎯', rarity: AchievementRarity.EPIC },
];

const initialUserAchievements: UserAchievement[] = [
    { id: 'uach1', userId: 'user1', achievementId: 'ach1', earnedAt: new Date() },
    { id: 'uach2', userId: 'user1', achievementId: 'ach3', earnedAt: new Date() },
];

export default function useMockData() {
  const [user] = useState(initialUser);
  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [careEvents, setCareEvents] = useState<CareEvent[]>(initialCareEvents);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [xp, setXp] = useState(250); // initial XP
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(initialUserAchievements);

  const addPlant = useCallback((newPlantData: Omit<Plant, 'id' | 'createdAt'>) => {
    const newPlant: Plant = {
      ...newPlantData,
      id: uuidv4(),
      createdAt: new Date(),
      wateringFrequencyDays: DEFAULT_WATERING_FREQUENCY[newPlantData.type] || DEFAULT_WATERING_FREQUENCY[PlantType.OTHER],
    };
    setPlants(prev => [...prev, newPlant]);
    // Potentially award achievement for first plant
    if (!userAchievements.some(a => a.achievementId === 'ach1')) {
        setUserAchievements(prev => [...prev, { id: uuidv4(), userId: user.id, achievementId: 'ach1', earnedAt: new Date() }]);
    }
  }, [user.id, userAchievements]);

  const updatePlant = useCallback((plantId: string, updatedData: Partial<Omit<Plant, 'id'>>) => {
    setPlants(prev => prev.map(p => p.id === plantId ? { ...p, ...updatedData } : p));
  }, []);

  const deletePlant = useCallback((plantId: string) => {
    setPlants(prev => prev.filter(p => p.id !== plantId));
  }, []);

  const logCare = useCallback((plantId: string, careType: CareType) => {
    const newEvent: CareEvent = {
      id: uuidv4(),
      userId: user.id,
      plantId,
      type: careType,
      occurredAt: new Date(),
      createdAt: new Date(),
    };
    setCareEvents(prev => [newEvent, ...prev]);

    const xpGained = CARE_XP_REWARDS[careType] || 0;
    setXp(prev => prev + xpGained);

    setPlants(prev => prev.map(p => {
      if (p.id === plantId) {
        const updates: Partial<Plant> = {};
        switch(careType) {
          case CareType.WATER:
            updates.lastWateredAt = new Date();
            break;
          case CareType.FERTILIZE:
            updates.lastFertilizedAt = new Date();
            updates.nextFertilizingDate = undefined; // Reset until user sets a new one
            break;
          case CareType.REPOT:
            updates.lastRepottedAt = new Date();
            updates.nextRepottingDate = undefined; // Reset
            break;
          case CareType.TRIM:
            updates.lastTrimmedAt = new Date();
            updates.nextTrimmingDate = undefined; // Reset
            break;
        }
        return { ...p, ...updates };
      }
      return p;
    }));

    if (careType === CareType.WATER) {
      setStats(prev => ({
        ...prev,
        totalWaterings: prev.totalWaterings + 1,
        // In a real app, this logic would be more complex, checking dates to not break the streak.
        // For this mock, we just increment.
        streakWater: prev.streakWater + 1, 
      }));
    }
    
    // Potentially award achievement for first watering
    if (!userAchievements.some(a => a.achievementId === 'ach3')) {
        setUserAchievements(prev => [...prev, { id: uuidv4(), userId: user.id, achievementId: 'ach3', earnedAt: new Date() }]);
    }

  }, [user.id, userAchievements]);
  
  const levelInfo = useMemo<LevelInfo>(() => {
    const currentLevelData = [...XP_LEVELS].reverse().find(l => xp >= l.minXp) || XP_LEVELS[0];
    const nextLevelData = XP_LEVELS.find(l => l.level === currentLevelData.level + 1);

    const levelXp = xp - currentLevelData.minXp;
    const nextLevelXpTotal = nextLevelData ? nextLevelData.minXp - currentLevelData.minXp : levelXp;
    const progressPercentage = nextLevelData ? (levelXp / nextLevelXpTotal) * 100 : 100;
    
    return {
      userId: user.id,
      xp,
      level: currentLevelData.level,
      levelName: currentLevelData.name,
      levelIcon: currentLevelData.icon,
      nextLevelXp: nextLevelData ? nextLevelData.minXp : xp,
      progressPercentage: Math.min(100, progressPercentage),
    };
  }, [xp, user.id]);

  const achievements = useMemo(() => {
    return allAchievements.map(ach => {
      const userAch = userAchievements.find(ua => ua.achievementId === ach.id);
      return {
        ...ach,
        earnedAt: userAch?.earnedAt,
      };
    });
  }, [userAchievements]);

  return {
    user,
    plants,
    careEvents,
    stats,
    levelInfo,
    achievements,
    addPlant,
    updatePlant,
    deletePlant,
    logCare,
  };
}
