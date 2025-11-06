import { useState, useMemo } from 'react';
import { Plant, Stats, LevelProgress, CareType, PlantLocation, PlantType, LevelInfo, CareEvent } from '../types';
import { XP_LEVELS, CARE_XP_REWARDS, DEFAULT_WATERING_FREQUENCY } from '../constants';

const initialPlants: Plant[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Monstera',
    photoUrl: 'https://picsum.photos/id/106/400/400',
    location: PlantLocation.HOME,
    type: PlantType.FOLIAGE,
    lastWateredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    wateringFrequencyDays: 5,
    createdAt: new Date(),
    lastFertilizedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    nextFertilizingDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // in 4 days
    lastTrimmedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    nextTrimmingDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // in 50 days
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Snake Plant',
    photoUrl: 'https://picsum.photos/id/1015/400/400',
    location: PlantLocation.OFFICE,
    type: PlantType.SUCCULENT,
    lastWateredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago - due today
    wateringFrequencyDays: 14,
    createdAt: new Date(),
  },
   {
    id: '3',
    userId: 'user1',
    name: 'Fiddle Leaf',
    photoUrl: 'https://picsum.photos/id/1025/400/400',
    location: PlantLocation.BALCONY,
    type: PlantType.FOLIAGE,
    lastWateredAt: new Date(), // today
    wateringFrequencyDays: 7,
    createdAt: new Date(),
  },
];

const initialStats: Stats = {
  userId: 'user1',
  totalWaterings: 42,
  streakWater: 5,
};

const initialLevelProgress: LevelProgress = {
  userId: 'user1',
  xp: 120,
  level: 2,
};

const initialCareEvents: CareEvent[] = [
    { id: 'ce1', userId: 'user1', plantId: '1', type: CareType.WATER, occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), createdAt: new Date() },
    { id: 'ce2', userId: 'user1', plantId: '2', type: CareType.WATER, occurredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), createdAt: new Date() },
    { id: 'ce3', userId: 'user1', plantId: '3', type: CareType.WATER, occurredAt: new Date(), createdAt: new Date() },
    { id: 'ce4', userId: 'user1', plantId: '1', type: CareType.FERTILIZE, occurredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), note: 'Использовал удобрение для роста', createdAt: new Date() },
    { id: 'ce5', userId: 'user1', plantId: '3', type: CareType.TRIM, occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Удалил сухие листья', createdAt: new Date() },
];

const initialUser = {
  id: 'user1',
  name: 'Gardener',
  photoUrl: 'https://picsum.photos/id/237/200/200',
};


export const useMockData = () => {
  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [levelProgress, setLevelProgress] = useState<LevelProgress>(initialLevelProgress);
  const [careEvents, setCareEvents] = useState<CareEvent[]>(initialCareEvents);
  const [user, setUser] = useState(initialUser);

  const levelInfo: LevelInfo = useMemo(() => {
    const currentLevelData = XP_LEVELS.find(l => l.level === levelProgress.level) || XP_LEVELS[0];
    const nextLevelData = XP_LEVELS.find(l => l.level === levelProgress.level + 1);

    const nextLevelXp = nextLevelData ? nextLevelData.minXp : levelProgress.xp;
    const currentLevelMinXp = currentLevelData.minXp;
    
    const xpInLevel = levelProgress.xp - currentLevelMinXp;
    const xpForNextLevel = nextLevelXp - currentLevelMinXp;

    const progressPercentage = xpForNextLevel > 0 ? Math.floor((xpInLevel / xpForNextLevel) * 100) : 100;

    return {
      ...levelProgress,
      levelName: currentLevelData.name,
      levelIcon: currentLevelData.icon,
      nextLevelXp,
      progressPercentage,
    };
  }, [levelProgress]);
  
  const updateLevel = (newXp: number) => {
    setLevelProgress(currentProgress => {
      const totalXp = currentProgress.xp + newXp;
      const newLevelData = [...XP_LEVELS].reverse().find(l => totalXp >= l.minXp);
      return {
        ...currentProgress,
        xp: totalXp,
        level: newLevelData ? newLevelData.level : currentProgress.level,
      };
    });
  };

  const addPlant = (newPlantData: Omit<Plant, 'id' | 'createdAt'>) => {
    const plant: Plant = {
      ...newPlantData,
      id: new Date().toISOString(),
      createdAt: new Date(),
      wateringFrequencyDays: newPlantData.wateringFrequencyDays || DEFAULT_WATERING_FREQUENCY[newPlantData.type],
    };
    setPlants(currentPlants => [...currentPlants, plant]);
  };
  
  const updatePlant = (plantId: string, updatedData: Partial<Omit<Plant, 'id'>>) => {
    setPlants(currentPlants => 
        currentPlants.map(p => 
            p.id === plantId ? { ...p, ...updatedData } : p
        )
    );
  };

  const deletePlant = (plantId: string) => {
    setPlants(currentPlants => currentPlants.filter(p => p.id !== plantId));
    setCareEvents(currentEvents => currentEvents.filter(e => e.plantId !== plantId));
  };

  const logCareEvent = (plantId: string, type: CareType, note?: string) => {
    const newEvent: CareEvent = {
        id: new Date().toISOString(),
        userId: 'user1',
        plantId,
        type,
        occurredAt: new Date(),
        createdAt: new Date(),
        note,
    };
    setCareEvents(currentEvents => [newEvent, ...currentEvents]);
    
    updateLevel(CARE_XP_REWARDS[type] || 0);

    setPlants(currentPlants =>
      currentPlants.map(p => {
        if (p.id === plantId) {
          const updatedPlant = { ...p };
          const nextYear = new Date();
          nextYear.setFullYear(nextYear.getFullYear() + 1);

          switch(type) {
            case CareType.WATER:
              updatedPlant.lastWateredAt = new Date();
              break;
            case CareType.FERTILIZE:
              updatedPlant.lastFertilizedAt = new Date();
              updatedPlant.nextFertilizingDate = nextYear;
              break;
            case CareType.REPOT:
              updatedPlant.lastRepottedAt = new Date();
              updatedPlant.nextRepottingDate = nextYear;
              break;
            case CareType.TRIM:
              updatedPlant.lastTrimmedAt = new Date();
              updatedPlant.nextTrimmingDate = nextYear;
              break;
          }
          return updatedPlant;
        }
        return p;
      })
    );
      
    if (type === CareType.WATER) {
        setStats(currentStats => ({
            ...currentStats,
            totalWaterings: currentStats.totalWaterings + 1,
            streakWater: currentStats.streakWater + 1, // Simplified streak logic
        }));
    }
  };
  
  const waterAllDuePlants = () => {
    let wateredCount = 0;
    const newEvents: CareEvent[] = [];
    setPlants(currentPlants =>
      currentPlants.map(p => {
        const daysSinceWatered = (new Date().getTime() - p.lastWateredAt.getTime()) / (1000 * 3600 * 24);
        if (daysSinceWatered >= p.wateringFrequencyDays) {
          wateredCount++;
          newEvents.push({
            id: new Date().toISOString() + p.id,
            userId: 'user1',
            plantId: p.id,
            type: CareType.WATER,
            occurredAt: new Date(),
            createdAt: new Date(),
          });
          return { ...p, lastWateredAt: new Date() };
        }
        return p;
      })
    );

    if(wateredCount > 0){
        setCareEvents(currentEvents => [...newEvents, ...currentEvents]);
        setStats(currentStats => ({
            ...currentStats,
            totalWaterings: currentStats.totalWaterings + wateredCount,
            streakWater: currentStats.streakWater + wateredCount,
        }));
        updateLevel(CARE_XP_REWARDS.WATER * wateredCount);
    }
  };

  return { plants, stats, levelInfo, addPlant, logCareEvent, waterAllDuePlants, careEvents, updatePlant, user, deletePlant };
};