import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Plant, User, Stats, LevelInfo, Achievement, Community, CommunityPost, Comment, CareEvent,
  CareType, PlantLocation, PlantType, AchievementRarity, Friend, Notification
} from '../types';
import { XP_LEVELS, CARE_XP_REWARDS, DEFAULT_WATERING_FREQUENCY } from '../constants';
import {
    StarIcon, TrophyIcon,
    FirstWaterIcon, FirstPlantIcon, FirstCommunityIcon, FirstFertilizeIcon, FirstRepotIcon, FirstTrimIcon,
    FivePlantsIcon, TenPlantsIcon, WateringMasterIcon, FirstFriendIcon, CommunityFounderIcon
} from '../components/icons';

// --- HELPERS ---
const uuid = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// --- MOCK DATA (defined outside the hook to prevent re-creation) ---

const MOCK_FRIENDS_DATA: Friend[] = [
    { id: 'friend1', name: 'Елена', photoUrl: 'https://i.pravatar.cc/150?u=friend1' },
    { id: 'friend2', name: 'Михаил', photoUrl: 'https://i.pravatar.cc/150?u=friend2' },
    { id: 'friend3', name: 'Ольга', photoUrl: 'https://i.pravatar.cc/150?u=friend3' },
    { id: 'friend4', name: 'Дмитрий', photoUrl: 'https://i.pravatar.cc/150?u=friend4' },
    { id: 'friend5', name: 'Светлана', photoUrl: 'https://i.pravatar.cc/150?u=friend5' },
    { id: 'friend6', name: 'Алексей', photoUrl: 'https://i.pravatar.cc/150?u=friend6' },
    { id: 'friend7', name: 'Ирина', photoUrl: 'https://i.pravatar.cc/150?u=friend7' },
    { id: 'friend8', name: 'Виктор', photoUrl: 'https://i.pravatar.cc/150?u=friend8' },
    { id: 'friend9', name: 'Татьяна', photoUrl: 'https://i.pravatar.cc/150?u=friend9' },
    { id: 'friend10', name: 'Андрей', photoUrl: 'https://i.pravatar.cc/150?u=friend10' },
    { id: 'friend11', name: 'Наталья', photoUrl: 'https://i.pravatar.cc/150?u=friend11' },
    { id: 'friend12', name: 'Сергей', photoUrl: 'https://i.pravatar.cc/150?u=friend12' },
];

const ALL_MOCK_USERS: User[] = [
    {
        id: 'user1',
        name: 'Анна',
        photoUrl: 'https://i.pravatar.cc/150?u=user1',
        gender: 'female',
        age: 28,
        telegramUsername: 'anna_plantlover',
        about: 'Обожаю комнатные растения! Моя коллекция постоянно растет. Рада поделиться советами и научиться новому.',
        friends: MOCK_FRIENDS_DATA,
    },
    // FIX: Explicitly typed the return value of the .map() callback as `User` to prevent TypeScript from widening the `gender` property to `string`, which caused a type mismatch with the `User[]` type annotation for `ALL_MOCK_USERS`.
    ...MOCK_FRIENDS_DATA.map((f, i): User => ({
        id: f.id,
        name: f.name,
        photoUrl: f.photoUrl,
        gender: i % 2 === 0 ? 'female' : 'male',
        age: 25 + i * 2,
        telegramUsername: `${f.name.toLowerCase()}_${i}`,
        about: 'Люблю природу и садоводство.',
        friends: [],
    })),
     {
        id: 'user_not_friend',
        name: 'Сергей',
        photoUrl: 'https://i.pravatar.cc/150?u=user_not_friend',
        gender: 'male',
        age: 32,
        telegramUsername: 'sergey_green_thumb',
        about: 'Профессиональный садовник.',
        friends: [],
    },
    {
        id: 'user_dmitry_3',
        name: 'Дмитрий_3',
        photoUrl: 'https://i.pravatar.cc/150?u=dmitry_3',
        gender: 'male',
        age: 29,
        telegramUsername: 'дмитрий_3',
        about: 'Ищу новых друзей для обмена опытом в садоводстве.',
        friends: [],
    }
];

const MOCK_PLANTS_DATA: Plant[] = [
  {
    id: 'plant1', userId: 'user1', name: 'Монстера Делициоза',
    photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=600&h=600&fit=crop',
    location: PlantLocation.HOME, type: PlantType.FOLIAGE,
    lastWateredAt: daysAgo(3), createdAt: daysAgo(50), wateringFrequencyDays: 7,
    lastFertilizedAt: daysAgo(20), nextFertilizingDate: daysFromNow(10),
  },
  {
    id: 'plant2', userId: 'user1', name: 'Фикус Эластика',
    photoUrl: 'https://images.unsplash.com/photo-1633519421873-a59483842821?q=80&w=600&h=600&fit=crop',
    location: PlantLocation.OFFICE, type: PlantType.FOLIAGE,
    lastWateredAt: daysAgo(6), createdAt: daysAgo(120), wateringFrequencyDays: 10,
    lastRepottedAt: daysAgo(100), nextRepottingDate: daysFromNow(265),
  },
  {
    id: 'plant3', userId: 'user1', name: 'Замиокулькас',
    photoUrl: 'https://images.unsplash.com/photo-1617101882895-c0f5233c8275?q=80&w=600&h=600&fit=crop',
    location: PlantLocation.HOME, type: PlantType.SUCCULENT,
    lastWateredAt: daysAgo(12), createdAt: daysAgo(80), wateringFrequencyDays: 14,
  },
  {
    id: 'plant4', userId: 'user1', name: 'Спатифиллум',
    photoUrl: 'https://images.unsplash.com/photo-1599421498212-9c484d8b5a83?q=80&w=600&h=600&fit=crop',
    location: PlantLocation.BALCONY, type: PlantType.FLOWERING,
    lastWateredAt: daysAgo(1), createdAt: daysAgo(200), wateringFrequencyDays: 4,
    lastTrimmedAt: daysAgo(30), nextTrimmingDate: daysFromNow(60),
  },
  {
    id: 'plant_friend1', userId: 'friend1', name: 'Крассула',
    photoUrl: 'https://images.unsplash.com/photo-1608625559132-09991201533b?q=80&w=600&h=600&fit=crop',
    location: PlantLocation.HOME, type: PlantType.SUCCULENT,
    lastWateredAt: daysAgo(10), createdAt: daysAgo(300), wateringFrequencyDays: 15,
  },
];


const MOCK_CARE_EVENTS_DATA: CareEvent[] = [
    { id: uuid(), userId: 'user1', plantId: 'plant1', type: CareType.WATER, occurredAt: daysAgo(3), createdAt: daysAgo(3) },
    { id: uuid(), userId: 'user1', plantId: 'plant2', type: CareType.WATER, occurredAt: daysAgo(6), createdAt: daysAgo(6) },
    { id: uuid(), userId: 'user1', plantId: 'plant3', type: CareType.WATER, occurredAt: daysAgo(12), createdAt: daysAgo(12) },
    { id: uuid(), userId: 'user1', plantId: 'plant4', type: CareType.WATER, occurredAt: daysAgo(1), createdAt: daysAgo(1) },
    { id: uuid(), userId: 'user1', plantId: 'plant1', type: CareType.FERTILIZE, occurredAt: daysAgo(20), createdAt: daysAgo(20) },
    { id: uuid(), userId: 'user1', plantId: 'plant2', type: CareType.REPOT, occurredAt: daysAgo(100), createdAt: daysAgo(100) },
    { id: uuid(), userId: 'user1', plantId: 'plant4', type: CareType.TRIM, occurredAt: daysAgo(30), createdAt: daysAgo(30), note: "Удалила старые листья" },
];


const MOCK_ACHIEVEMENTS_DATA: Achievement[] = [
  { id: 'ach1', code: 'FIRST_WATER', name: 'Первая капля', description: 'Полейте свое первое растение.', icon: React.createElement(FirstWaterIcon), rarity: AchievementRarity.COMMON },
  { id: 'ach2', code: 'FIRST_PLANT', name: 'Новый друг', description: 'Добавьте свое первое растение.', icon: React.createElement(FirstPlantIcon), rarity: AchievementRarity.COMMON },
  { id: 'ach3', code: 'FIRST_COMMUNITY', name: 'Общительный садовод', description: 'Вступите в свое первое сообщество.', icon: React.createElement(FirstCommunityIcon), rarity: AchievementRarity.COMMON },
  { id: 'ach4', code: 'FIRST_FERTILIZE', name: 'Первая подкормка', description: 'Удобрите растение в первый раз.', icon: React.createElement(FirstFertilizeIcon), rarity: AchievementRarity.COMMON },
  { id: 'ach5', code: 'FIRST_REPOT', name: 'Новый дом', description: 'Пересадите растение в первый раз.', icon: React.createElement(FirstRepotIcon), rarity: AchievementRarity.RARE },
  { id: 'ach6', code: 'FIRST_TRIM', name: 'Легкая рука', description: 'Обрежьте растение в первый раз.', icon: React.createElement(FirstTrimIcon), rarity: AchievementRarity.RARE },
  { id: 'ach7', code: 'FIVE_PLANTS', name: 'Маленькая роща', description: 'Вырастите 5 растений.', icon: React.createElement(FivePlantsIcon), rarity: AchievementRarity.RARE },
  { id: 'ach8', code: 'TEN_PLANTS', name: 'Городские джунгли', description: 'Вырастите 10 растений.', icon: React.createElement(TenPlantsIcon), rarity: AchievementRarity.EPIC },
  { id: 'ach9', code: 'WATERING_MASTER', name: 'Мастер полива', description: 'Совершите 25 поливов.', icon: React.createElement(WateringMasterIcon), rarity: AchievementRarity.RARE },
  { id: 'ach10', code: 'FIRST_FRIEND', name: 'Рука дружбы', description: 'Добавьте первого друга.', icon: React.createElement(FirstFriendIcon), rarity: AchievementRarity.COMMON },
  { id: 'ach11', code: 'COMMUNITY_FOUNDER', name: 'Основатель', description: 'Создайте свое первое сообщество.', icon: React.createElement(CommunityFounderIcon), rarity: AchievementRarity.EPIC },
];

const MOCK_COMMUNITIES_DATA: Community[] = [
  {
    id: 'community1', name: 'Клуб любителей суккулентов',
    description: 'Все о суккулентах и кактусах. Делимся фотографиями, советами по уходу и размножению.',
    photoUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&h=400&fit=crop',
    memberCount: 1234, isMember: true,
  },
  {
    id: 'community2', name: 'Орхидеи: магия и уход',
    description: 'Сообщество для всех, кто влюблен в орхидеи. От новичков до профессионалов.',
    photoUrl: 'https://images.unsplash.com/photo-1558501202-b25076e7399a?q=80&w=800&h=400&fit=crop',
    memberCount: 876, isMember: false,
  },
   {
    id: 'community3', name: 'Городские джунгли',
    description: 'Превращаем квартиры в зеленые оазисы. Идеи, лайфхаки и вдохновение.',
    photoUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=800&h=400&fit=crop',
    memberCount: 2500, isMember: true,
  },
];

const MOCK_POSTS_DATA: CommunityPost[] = [
    {
        id: 'post1', communityId: 'community1', authorId: 'friend1', authorName: 'Елена', authorPhotoUrl: 'https://i.pravatar.cc/150?u=friend1',
        text: 'Посмотрите, как подросла моя эхеверия за лето! 😍',
        photoUrl: 'https://images.unsplash.com/photo-1509423350616-3652d8523b49?q=80&w=600&h=600&fit=crop',
        createdAt: daysAgo(1), likes: 25, comments: 1,
    },
    {
        id: 'post2', communityId: 'community1', authorId: 'user1', authorName: 'Анна', authorPhotoUrl: 'https://i.pravatar.cc/150?u=user1',
        text: 'Нужен совет! На листьях кактуса появились желтые пятна. Что это может быть?',
        createdAt: daysAgo(2), likes: 10, comments: 2,
    },
];

const MOCK_COMMENTS_DATA: Comment[] = [
    { id: uuid(), postId: 'post1', authorId: 'user1', authorName: 'Анна', authorPhotoUrl: 'https://i.pravatar.cc/150?u=user1', text: 'Какая красота! ✨', createdAt: daysAgo(1) },
    { id: uuid(), postId: 'post2', authorId: 'friend2', authorName: 'Михаил', authorPhotoUrl: 'https://i.pravatar.cc/150?u=friend2', text: 'Похоже на солнечный ожог. Не стоял на прямом солнце?', createdAt: daysAgo(2) },
    { id: uuid(), postId: 'post2', authorId: 'user1', authorName: 'Анна', authorPhotoUrl: 'https://i.pravatar.cc/150?u=user1', text: 'Да, как раз переставила на южное окно. Спасибо, уберу!', createdAt: daysAgo(1) },
];


export const useMockData = () => {
  const [user, setUser] = useState<User>(ALL_MOCK_USERS[0]);
  const [plants, setPlants] = useState<Plant[]>(MOCK_PLANTS_DATA);
  const [careEvents, setCareEvents] = useState<CareEvent[]>(MOCK_CARE_EVENTS_DATA);
  const [achievements, setAchievements] = useState<(Achievement & { earnedAt?: Date })[]>(MOCK_ACHIEVEMENTS_DATA);
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES_DATA);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(MOCK_POSTS_DATA);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS_DATA);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set(['post1']));
  const [pendingNotifications, setPendingNotifications] = useState<Notification[]>([]);
  const [pendingFriendRequests, setPendingFriendRequests] = useState<User[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
        const userToRequest = ALL_MOCK_USERS.find(u => u.telegramUsername === 'дмитрий_3');
        if (userToRequest) {
            setPendingFriendRequests([userToRequest]);
        }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // Master achievement checker effect
  useEffect(() => {
    const newlyUnlocked: { code: string; name: string }[] = [];

    const check = (code: string, condition: boolean) => {
        const ach = achievements.find(a => a.code === code);
        if (ach && !ach.earnedAt && condition) {
            newlyUnlocked.push({ code, name: ach.name });
        }
    };
    
    // Calculate stats
    const waterings = careEvents.filter(e => e.userId === user.id && e.type === CareType.WATER).length;
    const fertilizes = careEvents.filter(e => e.userId === user.id && e.type === CareType.FERTILIZE).length;
    const repots = careEvents.filter(e => e.userId === user.id && e.type === CareType.REPOT).length;
    const trims = careEvents.filter(e => e.userId === user.id && e.type === CareType.TRIM).length;
    const userPlants = plants.filter(p => p.userId === user.id);
    const userIsMember = communities.some(c => c.isMember);
    
    // Check all achievements based on state
    check('FIRST_WATER', waterings > 0);
    check('WATERING_MASTER', waterings >= 25);
    check('FIRST_FERTILIZE', fertilizes > 0);
    check('FIRST_REPOT', repots > 0);
    check('FIRST_TRIM', trims > 0);
    check('FIRST_PLANT', userPlants.length > 0);
    check('FIVE_PLANTS', userPlants.length >= 5);
    check('TEN_PLANTS', userPlants.length >= 10);
    check('FIRST_COMMUNITY', userIsMember);
    check('FIRST_FRIEND', user.friends.length > 0);

    if (newlyUnlocked.length > 0) {
        setAchievements(prev => prev.map(a => {
            const isUnlocked = newlyUnlocked.some(u => u.code === a.code);
            if (isUnlocked && !a.earnedAt) {
                return { ...a, earnedAt: new Date() };
            }
            return a;
        }));

        setPendingNotifications(prev => [
            ...prev,
            ...newlyUnlocked.map(ach => ({
                id: uuid(),
                message: `Достижение получено: ${ach.name}!`,
                icon: React.createElement(TrophyIcon, { className: "w-5 h-5 text-yellow-400" })
            }))
        ]);
    }

  }, [plants, careEvents, communities, user, achievements]);

  const stats = useMemo<Stats>(() => {
    const totalWaterings = careEvents.filter(e => e.type === CareType.WATER).length;
    const totalFertilizes = careEvents.filter(e => e.type === CareType.FERTILIZE).length;
    const totalRepots = careEvents.filter(e => e.type === CareType.REPOT).length;
    const totalTrims = careEvents.filter(e => e.type === CareType.TRIM).length;
    return {
      userId: 'user1',
      totalWaterings,
      totalFertilizes,
      totalRepots,
      totalTrims,
      streakWater: 10, // Mocked for now
      totalActions: totalWaterings + totalFertilizes + totalRepots + totalTrims,
    };
  }, [careEvents]);

  const levelInfo = useMemo<LevelInfo>(() => {
    const xp = (stats.totalActions * 5) + (stats.totalWaterings * CARE_XP_REWARDS.WATER) +
               (stats.totalFertilizes * CARE_XP_REWARDS.FERTILIZE) +
               (stats.totalRepots * CARE_XP_REWARDS.REPOT) +
               (stats.totalTrims * CARE_XP_REWARDS.TRIM);

    let currentLevelInfo = XP_LEVELS[0];
    let nextLevelInfo = XP_LEVELS[1];
    for (let i = 0; i < XP_LEVELS.length; i++) {
        if (xp >= XP_LEVELS[i].minXp) {
            currentLevelInfo = XP_LEVELS[i];
            nextLevelInfo = XP_LEVELS[i + 1] || null;
        } else {
            break;
        }
    }

    const nextLevelXp = nextLevelInfo ? nextLevelInfo.minXp : currentLevelInfo.minXp;
    const currentLevelMinXp = currentLevelInfo.minXp;
    const progressInLevel = xp - currentLevelMinXp;
    const xpForNextLevel = nextLevelXp - currentLevelMinXp;
    const progressPercentage = xpForNextLevel > 0 ? Math.min((progressInLevel / xpForNextLevel) * 100, 100) : 100;

    return {
      userId: 'user1',
      xp,
      level: currentLevelInfo.level,
      levelName: currentLevelInfo.name,
      levelIcon: currentLevelInfo.icon,
      nextLevelXp,
      progressPercentage,
    };
  }, [stats]);
  
  const addPlant = useCallback((newPlantData: Omit<Plant, 'id' | 'createdAt'>) => {
    const newPlant: Plant = {
        ...newPlantData,
        id: uuid(),
        createdAt: new Date(),
        wateringFrequencyDays: DEFAULT_WATERING_FREQUENCY[newPlantData.type] || 7,
    };
    setPlants(prev => [...prev, newPlant]);
  }, []);

  const updatePlant = useCallback((plantId: string, updatedData: Partial<Omit<Plant, 'id'>>) => {
    setPlants(prev => prev.map(p => p.id === plantId ? { ...p, ...updatedData } : p));
  }, []);

  const deletePlant = useCallback((plantId: string) => {
    setPlants(prev => prev.filter(p => p.id !== plantId));
    setCareEvents(prev => prev.filter(e => e.plantId !== plantId));
  }, []);

  const logCareEvent = useCallback((plantId: string, careType: CareType) => {
    const today = new Date().toISOString().split('T')[0];
    
    const lastEventToday = careEvents.find(event => 
        event.plantId === plantId &&
        event.type === careType &&
        new Date(event.occurredAt).toISOString().split('T')[0] === today
    );

    if (lastEventToday) {
        setPendingNotifications(prev => [...prev, {
            id: uuid(),
            message: 'Опыт за это действие сегодня уже получен.',
            icon: React.createElement(StarIcon, { className: "w-5 h-5 text-yellow-400" }),
        }]);
        return;
    }

    const newEvent: CareEvent = {
        id: uuid(),
        userId: 'user1',
        plantId,
        type: careType,
        occurredAt: new Date(),
        createdAt: new Date(),
    };
    setCareEvents(prev => [newEvent, ...prev]);

    setPlants(prev => prev.map(p => {
        if (p.id === plantId) {
            const updates: Partial<Plant> = {};
            if (careType === CareType.WATER) updates.lastWateredAt = new Date();
            if (careType === CareType.FERTILIZE) updates.lastFertilizedAt = new Date();
            if (careType === CareType.REPOT) updates.lastRepottedAt = new Date();
            if (careType === CareType.TRIM) updates.lastTrimmedAt = new Date();
            return { ...p, ...updates };
        }
        return p;
    }));
  }, [careEvents]);

  const updateUser = useCallback((updatedData: User) => {
      setUser(updatedData);
  }, []);

  const joinCommunity = useCallback((communityId: string) => {
    setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c));
  }, []);

  const leaveCommunity = useCallback((communityId: string) => {
    setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, isMember: false, memberCount: c.memberCount - 1 } : c));
  }, []);

  const createCommunity = useCallback((communityData: Omit<Community, 'id' | 'memberCount' | 'isMember'>) => {
    const newCommunity: Community = {
        ...communityData,
        id: uuid(),
        memberCount: 1,
        isMember: true,
    };
    setCommunities(prev => [newCommunity, ...prev]);

    const founderAch = achievements.find(a => a.code === 'COMMUNITY_FOUNDER');
    if (founderAch && !founderAch.earnedAt) {
        setAchievements(prev => prev.map(a => a.code === 'COMMUNITY_FOUNDER' ? { ...a, earnedAt: new Date() } : a));
        setPendingNotifications(prev => [...prev, {
            id: uuid(),
            message: `Достижение получено: ${founderAch.name}!`,
            icon: React.createElement(TrophyIcon, { className: "w-5 h-5 text-yellow-400" })
        }]);
    }
  }, [achievements]);

  const addPost = useCallback((communityId: string, data: { text: string; photoUrl?: string }) => {
    const newPost: CommunityPost = {
        id: uuid(),
        communityId,
        authorId: user.id,
        authorName: user.name,
        authorPhotoUrl: user.photoUrl,
        text: data.text,
        photoUrl: data.photoUrl,
        createdAt: new Date(),
        likes: 0,
        comments: 0,
    };
    setCommunityPosts(prev => [newPost, ...prev]);
  }, [user]);

  const updatePost = useCallback((postId: string, data: { text: string; photoUrl?: string }) => {
    setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, ...data } : p));
  }, []);

  const deletePost = useCallback((postId: string) => {
    setCommunityPosts(prev => prev.filter(p => p.id !== postId));
    setComments(prev => prev.filter(c => c.postId !== postId));
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    const newComment: Comment = {
        id: uuid(),
        postId,
        authorId: user.id,
        authorName: user.name,
        authorPhotoUrl: user.photoUrl,
        text,
        createdAt: new Date(),
    };
    setComments(prev => [...prev, newComment]);
    setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
  }, [user]);

  const toggleLikePost = useCallback((postId: string) => {
    setLikedPostIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
            newSet.delete(postId);
            setCommunityPosts(posts => posts.map(p => p.id === postId ? {...p, likes: p.likes - 1} : p));
        } else {
            newSet.add(postId);
            setCommunityPosts(posts => posts.map(p => p.id === postId ? {...p, likes: p.likes + 1} : p));
        }
        return newSet;
    });
  }, []);

  const searchUserByTelegram = useCallback((username: string): User | null => {
    const found = ALL_MOCK_USERS.find(u => u.telegramUsername?.toLowerCase() === username.toLowerCase().trim() && u.id !== user.id);
    return found || null;
  }, [user.id]);

  const addFriend = useCallback((userToAdd: User) => {
    if (!user.friends.some(f => f.id === userToAdd.id)) {
        const newFriend: Friend = { id: userToAdd.id, name: userToAdd.name, photoUrl: userToAdd.photoUrl };
        setUser(prev => ({
            ...prev,
            friends: [...prev.friends, newFriend],
        }));
    }
  }, [user.friends]);

  const handleFriendRequestAction = useCallback((requestingUser: User, accept: boolean) => {
    if (accept) {
      addFriend(requestingUser);
    }
    setPendingFriendRequests(prev => prev.filter(req => req.id !== requestingUser.id));
  }, [addFriend]);

  const removeFriend = useCallback((friendId: string) => {
    setUser(prev => ({
        ...prev,
        friends: prev.friends.filter(f => f.id !== friendId),
    }));
  }, []);

  const getUserById = useCallback((userId: string): User | undefined => {
    return ALL_MOCK_USERS.find(u => u.id === userId);
  }, []);

  const clearPendingNotifications = useCallback(() => {
    setPendingNotifications([]);
  }, []);
  
  return {
    plants, user, stats, levelInfo, achievements, communities, communityPosts, comments, careEvents,
    likedPostIds, toggleLikePost, getUserById, pendingNotifications, clearPendingNotifications,
    addPlant, updatePlant, deletePlant, logCareEvent, updateUser, joinCommunity, leaveCommunity,
    createCommunity, addPost, updatePost, deletePost, addComment, searchUserByTelegram, addFriend,
    removeFriend, pendingFriendRequests, handleFriendRequestAction
  };
};