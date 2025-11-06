import { useState, useCallback, useMemo, useEffect } from 'react';
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
  User,
  Friend,
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

const allUsers: User[] = [
    {
        id: 'user1',
        name: 'Анна',
        photoUrl: 'https://i.pravatar.cc/150?u=user1',
        gender: 'female',
        age: 28,
        telegramUsername: '@anna_grows',
        about: 'Люблю комнатные растения и уют. В моей коллекции уже больше 15 разных видов! Ищу единомышленников для обмена опытом.',
        friends: []
    },
    { id: 'friend1', name: 'Иван', photoUrl: 'https://i.pravatar.cc/150?u=friend1', gender: 'male', age: 30, telegramUsername: '@ivan_k', about: 'Frontend разработчик и любитель кактусов.', friends: [] },
    { id: 'friend2', name: 'Мария', photoUrl: 'https://i.pravatar.cc/150?u=friend2', gender: 'female', age: 25, telegramUsername: '@maria_s', about: 'Обожаю цветущие растения!', friends: [] },
    { id: 'friend3', name: 'Петр', photoUrl: 'https://i.pravatar.cc/150?u=friend3', gender: 'male', age: 35, telegramUsername: '@petr_garden', about: 'Выращиваю овощи на балконе.', friends: [] },
    { id: 'friend4', name: 'Елена', photoUrl: 'https://i.pravatar.cc/150?u=friend4', gender: 'female', age: 29, telegramUsername: '@elena_ficus', about: 'Коллекционирую фикусы.', friends: [] },
    { id: 'friend5', name: 'Ольга', photoUrl: 'https://i.pravatar.cc/150?u=friend5', gender: 'female', age: 32, telegramUsername: '@olga_rose', about: 'Моя страсть - розы.', friends: [] },
    { id: 'friend6', name: 'Дмитрий', photoUrl: 'https://i.pravatar.cc/150?u=friend6', gender: 'male', age: 27, telegramUsername: '@dima_green', about: 'Просто люблю зелень в доме.', friends: [] },
    { id: 'user7', name: 'Сергей', photoUrl: 'https://i.pravatar.cc/150?u=user7', gender: 'male', age: 32, telegramUsername: '@sergey_dev', about: 'Backend developer, начинающий садовод.', friends: [] },
    { id: 'user8', name: 'Катя', photoUrl: 'https://i.pravatar.cc/150?u=user8', gender: 'female', age: 29, telegramUsername: '@katy_art', about: 'Дизайнер, ищу вдохновение в растениях.', friends: [] },
];


const initialUser: User = {
  ...allUsers[0],
  friends: [
    { id: 'friend1', name: 'Иван', photoUrl: 'https://i.pravatar.cc/150?u=friend1' },
    { id: 'friend2', name: 'Мария', photoUrl: 'https://i.pravatar.cc/150?u=friend2' },
    { id: 'friend3', name: 'Петр', photoUrl: 'https://i.pravatar.cc/150?u=friend3' },
    { id: 'friend4', name: 'Елена', photoUrl: 'https://i.pravatar.cc/150?u=friend4' },
    { id: 'friend5', name: 'Ольга', photoUrl: 'https://i.pravatar.cc/150?u=friend5' },
    { id: 'friend6', name: 'Дмитрий', photoUrl: 'https://i.pravatar.cc/150?u=friend6' },
  ]
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
  totalFertilizes: 5,
  totalRepots: 2,
  totalTrims: 8,
  streakWater: 3,
  totalActions: 27,
};

const allAchievements: Achievement[] = [
    // Existing
    { id: 'ach1', code: 'FIRST_PLANT', name: 'Начинающий садовод', description: 'Добавить первое растение', icon: '🌱', rarity: AchievementRarity.COMMON },
    { id: 'ach2', code: 'FIVE_PLANTS', name: 'Коллекционер', description: 'Вырастить 5 растений', icon: '🪴', rarity: AchievementRarity.RARE },
    { id: 'ach3', code: 'FIRST_WATER', name: 'Первая капля', description: 'Полить растение в первый раз', icon: '💧', rarity: AchievementRarity.COMMON },
    { id: 'ach4', code: 'STREAK_7', name: 'Точность', description: 'Серия поливов в 7 дней', icon: '🎯', rarity: AchievementRarity.EPIC },
    // New
    { id: 'ach5', code: 'TEN_PLANTS', name: 'Садовод-любитель', description: 'Вырастить 10 растений', icon: '🌳', rarity: AchievementRarity.RARE },
    { id: 'ach6', code: 'TWENTY_PLANTS', name: 'Ботанический эксперт', description: 'Собрать коллекцию из 20 растений', icon: '🏞️', rarity: AchievementRarity.EPIC },
    { id: 'ach7', code: 'DIVERSE_GARDEN', name: 'Специалист по видам', description: 'Иметь хотя бы по одному растению каждого типа', icon: '🧬', rarity: AchievementRarity.RARE },
    { id: 'ach8', code: 'STREAK_14', name: 'Мастер рутины', description: 'Серия поливов в 14 дней', icon: '🗓️', rarity: AchievementRarity.RARE },
    { id: 'ach9', code: 'STREAK_30', name: 'Хранитель традиций', description: 'Серия поливов в 30 дней', icon: '🏛️', rarity: AchievementRarity.EPIC },
    { id: 'ach10', code: 'WATER_50', name: 'Гидратор', description: 'Полить растения 50 раз', icon: '💦', rarity: AchievementRarity.COMMON },
    { id: 'ach11', code: 'WATER_100', name: 'Повелитель дождя', description: 'Полить растения 100 раз', icon: '🌧️', rarity: AchievementRarity.RARE },
    { id: 'ach12', code: 'LEVEL_5', name: 'Опытный цветовод', description: 'Достигнуть 5-го уровня', icon: '🌸', rarity: AchievementRarity.COMMON },
    { id: 'ach13', code: 'LEVEL_10', name: 'Мастер-садовод', description: 'Достигнуть 10-го уровня', icon: '👑', rarity: AchievementRarity.EPIC },
    { id: 'ach14', code: 'FIRST_FERTILIZE', name: 'Алхимик', description: 'Удобрить растение в первый раз', icon: '🧪', rarity: AchievementRarity.COMMON },
    { id: 'ach15', code: 'FIRST_REPOT', name: 'Новый дом', description: 'Пересадить растение в первый раз', icon: '🏡', rarity: AchievementRarity.COMMON },
    { id: 'ach16', code: 'FIRST_TRIM', name: 'Стилист', description: 'Обрезать растение в первый раз', icon: '✂️', rarity: AchievementRarity.COMMON },
    { id: 'ach17', code: 'ALL_CARE_PLANT', name: 'Полный уход', description: 'Выполнить все виды ухода за одним растением', icon: '✅', rarity: AchievementRarity.EPIC },
    { id: 'ach18', code: 'NIGHT_OWL', name: 'Ночной дозор', description: 'Ухаживать за растением ночью (с 22:00 до 6:00)', icon: '🦉', rarity: AchievementRarity.RARE },
    { id: 'ach19', code: 'PERFECT_SCHEDULER', name: 'Планировщик', description: 'Установить расписание для всех видов ухода для растения', icon: '📋', rarity: AchievementRarity.RARE },
];


const initialUserAchievements: UserAchievement[] = [
    { id: 'uach1', userId: 'user1', achievementId: 'ach1', earnedAt: new Date() },
    { id: 'uach2', userId: 'user1', achievementId: 'ach3', earnedAt: new Date() },
];

export default function useMockData() {
  const [user, setUser] = useState<User>(initialUser);
  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [careEvents, setCareEvents] = useState<CareEvent[]>(initialCareEvents);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [xp, setXp] = useState(250); // initial XP
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(initialUserAchievements);
  
  const achievementsMap = useMemo(() => new Map(allAchievements.map(a => [a.code, a])), []);

  const awardAchievement = useCallback((code: string) => {
    const achievement = achievementsMap.get(code);
    if (!achievement) return;

    const isAlreadyEarned = userAchievements.some(ua => ua.achievementId === achievement.id);
    if (!isAlreadyEarned) {
      setUserAchievements(prev => [...prev, {
        id: uuidv4(),
        userId: user.id,
        achievementId: achievement.id,
        earnedAt: new Date(),
      }]);
    }
  }, [achievementsMap, user.id, userAchievements]);

  const addPlant = useCallback((newPlantData: Omit<Plant, 'id' | 'createdAt'>) => {
    const newPlant: Plant = {
      ...newPlantData,
      id: uuidv4(),
      createdAt: new Date(),
      wateringFrequencyDays: DEFAULT_WATERING_FREQUENCY[newPlantData.type] || DEFAULT_WATERING_FREQUENCY[PlantType.OTHER],
    };
    
    setPlants(prev => {
        const newPlants = [...prev, newPlant];
        
        // Plant count achievements
        awardAchievement('FIRST_PLANT');
        if (newPlants.length >= 5) awardAchievement('FIVE_PLANTS');
        if (newPlants.length >= 10) awardAchievement('TEN_PLANTS');
        if (newPlants.length >= 20) awardAchievement('TWENTY_PLANTS');
        
        // Diverse garden achievement
        const plantTypes = new Set(newPlants.map(p => p.type));
        if (plantTypes.has(PlantType.FOLIAGE) && plantTypes.has(PlantType.FLOWERING) && plantTypes.has(PlantType.SUCCULENT) && plantTypes.has(PlantType.PALM)) {
            awardAchievement('DIVERSE_GARDEN');
        }
        
        return newPlants;
    });
  }, [awardAchievement]);

  const updatePlant = useCallback((plantId: string, updatedData: Partial<Omit<Plant, 'id'>>) => {
    setPlants(prev => prev.map(p => {
        if (p.id === plantId) {
            const updatedPlant = { ...p, ...updatedData };
            
            // Perfect Scheduler achievement
            if (
                updatedPlant.wateringFrequencyDays &&
                updatedPlant.nextFertilizingDate &&
                updatedPlant.nextRepottingDate &&
                updatedPlant.nextTrimmingDate
            ) {
                awardAchievement('PERFECT_SCHEDULER');
            }
            
            return updatedPlant;
        }
        return p;
    }));
  }, [awardAchievement]);

  const deletePlant = useCallback((plantId: string) => {
    setPlants(prev => prev.filter(p => p.id !== plantId));
  }, []);

  const logCare = useCallback((plantId: string, careType: CareType) => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check for a recent event of the same type for this plant
    const recentEvent = careEvents.find(
      event =>
        event.plantId === plantId &&
        event.type === careType &&
        new Date(event.occurredAt) > twentyFourHoursAgo
    );
    
    // Only award XP if no recent event is found
    if (!recentEvent) {
      const xpGained = CARE_XP_REWARDS[careType] || 0;
      setXp(prev => prev + xpGained);
    }
    
    const newEvent: CareEvent = {
      id: uuidv4(),
      userId: user.id,
      plantId,
      type: careType,
      occurredAt: now,
      createdAt: now,
    };
    
    const allEvents = [newEvent, ...careEvents];
    setCareEvents(allEvents);

    // Update plant last cared for dates
    setPlants(prev => prev.map(p => {
      if (p.id === plantId) {
        const updates: Partial<Plant> = {};
        switch(careType) {
          case CareType.WATER: updates.lastWateredAt = new Date(); break;
          case CareType.FERTILIZE: updates.lastFertilizedAt = new Date(); updates.nextFertilizingDate = undefined; break;
          case CareType.REPOT: updates.lastRepottedAt = new Date(); updates.nextRepottingDate = undefined; break;
          case CareType.TRIM: updates.lastTrimmedAt = new Date(); updates.nextTrimmingDate = undefined; break;
        }
        return { ...p, ...updates };
      }
      return p;
    }));
    
    // First time care achievements
    if(careType === CareType.WATER) awardAchievement('FIRST_WATER');
    if(careType === CareType.FERTILIZE) awardAchievement('FIRST_FERTILIZE');
    if(careType === CareType.REPOT) awardAchievement('FIRST_REPOT');
    if(careType === CareType.TRIM) awardAchievement('FIRST_TRIM');

    // Stats and streak achievements
    setStats(prev => {
        const newStats: Stats = {
            ...prev,
            totalActions: prev.totalActions + 1,
        };

        switch (careType) {
            case CareType.WATER: {
                const newTotalWaterings = prev.totalWaterings + 1;
                const newStreak = prev.streakWater + 1;
                
                if (newTotalWaterings >= 50) awardAchievement('WATER_50');
                if (newTotalWaterings >= 100) awardAchievement('WATER_100');
                
                if (newStreak >= 7) awardAchievement('STREAK_7');
                if (newStreak >= 14) awardAchievement('STREAK_14');
                if (newStreak >= 30) awardAchievement('STREAK_30');
                
                newStats.totalWaterings = newTotalWaterings;
                newStats.streakWater = newStreak;
                break;
            }
            case CareType.FERTILIZE:
                newStats.totalFertilizes = (prev.totalFertilizes || 0) + 1;
                break;
            case CareType.REPOT:
                newStats.totalRepots = (prev.totalRepots || 0) + 1;
                break;
            case CareType.TRIM:
                newStats.totalTrims = (prev.totalTrims || 0) + 1;
                break;
        }

        return newStats;
    });
    
    // All care for one plant achievement
    const careTypesForPlant = new Set(allEvents.filter(e => e.plantId === plantId).map(e => e.type));
    if(careTypesForPlant.size === 4) {
        awardAchievement('ALL_CARE_PLANT');
    }
    
    // Night Owl achievement
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 6) {
        awardAchievement('NIGHT_OWL');
    }

  }, [user.id, careEvents, awardAchievement]);
  
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
  
  // Level-based achievements
  useEffect(() => {
      if (levelInfo.level >= 5) awardAchievement('LEVEL_5');
      if (levelInfo.level >= 10) awardAchievement('LEVEL_10');
  }, [levelInfo.level, awardAchievement]);

  const achievements = useMemo(() => {
    return allAchievements.map(ach => {
      const userAch = userAchievements.find(ua => ua.achievementId === ach.id);
      return {
        ...ach,
        earnedAt: userAch?.earnedAt,
      };
    });
  }, [userAchievements]);
  
  const updateUser = useCallback((updatedData: User) => {
    setUser(updatedData);
  }, []);
  
  const searchUserByTelegram = useCallback((username: string): User | null => {
    if (!username.trim()) return null;
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    
    const foundUser = allUsers.find(
        u => u.telegramUsername?.toLowerCase() === formattedUsername.toLowerCase() && u.id !== user.id
    );
    
    return foundUser || null;
  }, [user.id]);

  const addFriend = useCallback((friendToAdd: User) => {
    const isAlreadyFriend = user.friends.some(f => f.id === friendToAdd.id);
    if (isAlreadyFriend || friendToAdd.id === user.id) {
        return; // Do nothing if already a friend or trying to add self
    }

    const newFriend: Friend = {
        id: friendToAdd.id,
        name: friendToAdd.name,
        photoUrl: friendToAdd.photoUrl,
    };

    setUser(currentUser => ({
        ...currentUser,
        friends: [...currentUser.friends, newFriend],
    }));
  }, [user.id, user.friends]);


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
    updateUser,
    searchUserByTelegram,
    addFriend,
  };
}