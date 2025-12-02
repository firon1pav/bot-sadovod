import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Plant, User, Stats, LevelInfo, Achievement, Community, CommunityPost, Comment, CareEvent,
  CareType, AchievementRarity, Friend, Notification, PlantLocation, PlantType
} from '../types';
import { XP_LEVELS, CARE_XP_REWARDS } from '../constants';
import {
    StarIcon,
    FirstWaterIcon, FirstPlantIcon, FirstCommunityIcon, FirstFertilizeIcon, FirstRepotIcon, FirstTrimIcon,
    FivePlantsIcon, TenPlantsIcon, WateringMasterIcon, FirstFriendIcon, CommunityFounderIcon
} from '../components/icons';

// --- HELPERS ---
const uuid = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// --- MOCK DATA ---
const MOCK_FRIENDS_DATA: Friend[] = [
    { id: 'friend1', name: 'Елена', photoUrl: 'https://i.pravatar.cc/150?u=friend1' },
    { id: 'friend2', name: 'Михаил', photoUrl: 'https://i.pravatar.cc/150?u=friend2' },
    { id: 'friend3', name: 'Ольга', photoUrl: 'https://i.pravatar.cc/150?u=friend3' },
    { id: 'friend4', name: 'Дмитрий', photoUrl: 'https://i.pravatar.cc/150?u=friend4' },
    { id: 'friend5', name: 'Светлана', photoUrl: 'https://i.pravatar.cc/150?u=friend5' },
    { id: 'friend6', name: 'Алексей', photoUrl: 'https://i.pravatar.cc/150?u=friend6' },
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
    id: 'plant2', userId: 'user1', name: 'Сансевиерия',
    photoUrl: 'https://images.unsplash.com/photo-1620127393309-8472506b3b52?q=80&w=600&h=600&fit=crop',
    location: PlantLocation.OFFICE, type: PlantType.SUCCULENT,
    lastWateredAt: daysAgo(10), createdAt: daysAgo(30), wateringFrequencyDays: 14,
  },
  {
    id: 'plant3', userId: 'user1', name: 'Фикус Лирата',
    photoUrl: 'https://images.unsplash.com/photo-1612361667232-069279038d1a?q=80&w=600&h=600&fit=crop',
    location: PlantLocation.HOME, type: PlantType.FOLIAGE,
    lastWateredAt: daysAgo(1), createdAt: daysAgo(15), wateringFrequencyDays: 5,
    lastTrimmedAt: daysAgo(60), nextTrimmingDate: daysFromNow(5),
  },
  {
     id: 'plant4', userId: 'user1', name: 'Орхидея',
     photoUrl: 'https://images.unsplash.com/photo-1566954979172-2c97c530f78d?q=80&w=600&h=600&fit=crop',
     location: PlantLocation.HOME, type: PlantType.FLOWERING,
     lastWateredAt: daysAgo(4), createdAt: daysAgo(100), wateringFrequencyDays: 7,
     lastRepottedAt: daysAgo(200), nextRepottingDate: daysFromNow(-2), // Overdue
  }
];

const MOCK_COMMUNITIES: Community[] = [
    {
        id: 'comm1', name: 'Любители Монстер', description: 'Всё о монстерах: уход, размножение, виды.',
        photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&h=400&fit=crop',
        memberCount: 1542, isMember: true,
    },
    {
        id: 'comm2', name: 'Суккуленты и Кактусы', description: 'Клуб любителей колючих и мясистых друзей.',
        photoUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=400&fit=crop',
        memberCount: 3200, isMember: false,
    },
     {
        id: 'comm3', name: 'Городской Огород', description: 'Выращиваем овощи и зелень на балконе.',
        photoUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=400&fit=crop',
        memberCount: 890, isMember: true,
    },
];

const MOCK_POSTS: CommunityPost[] = [
    {
        id: 'post1', communityId: 'comm1', authorId: 'friend1', authorName: 'Елена', authorPhotoUrl: 'https://i.pravatar.cc/150?u=friend1',
        text: 'Моя монстера наконец-то дала новый лист с прорезями! Я так счастлива 🎉',
        photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&h=400&fit=crop',
        createdAt: daysAgo(0.1), likes: 15, comments: 2
    },
    {
        id: 'post2', communityId: 'comm1', authorId: 'user1', authorName: 'Анна', authorPhotoUrl: 'https://i.pravatar.cc/150?u=user1',
        text: 'Подскажите, почему желтеют кончики листьев? Поливаю раз в неделю.',
        createdAt: daysAgo(1), likes: 3, comments: 5
    },
    {
        id: 'post3', communityId: 'comm3', authorId: 'friend2', authorName: 'Михаил', authorPhotoUrl: 'https://i.pravatar.cc/150?u=friend2',
        text: 'Первый урожай помидоров черри на балконе! 🍅',
        photoUrl: 'https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?w=600&h=400&fit=crop',
        createdAt: daysAgo(2), likes: 42, comments: 10
    }
];

const MOCK_COMMENTS: Comment[] = [
    { id: 'c1', postId: 'post1', authorId: 'user1', authorName: 'Анна', authorPhotoUrl: 'https://i.pravatar.cc/150?u=user1', text: 'Поздравляю! Это здорово.', createdAt: daysAgo(0.05) },
    { id: 'c2', postId: 'post2', authorId: 'friend3', authorName: 'Ольга', authorPhotoUrl: 'https://i.pravatar.cc/150?u=friend3', text: 'Возможно, слишком сухой воздух. Попробуй опрыскивать.', createdAt: daysAgo(0.8) },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
    { id: 'ach1', code: 'FIRST_WATER', name: 'Первый полив', description: 'Полить растение в первый раз', icon: React.createElement(FirstWaterIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.COMMON },
    { id: 'ach2', code: 'FIRST_PLANT', name: 'Начало коллекции', description: 'Добавить первое растение', icon: React.createElement(FirstPlantIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.COMMON },
    { id: 'ach3', code: 'FIVE_PLANTS', name: 'Малый сад', description: 'Собрать 5 растений', icon: React.createElement(FivePlantsIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.RARE },
    { id: 'ach4', code: 'TEN_PLANTS', name: 'Джунгли дома', description: 'Собрать 10 растений', icon: React.createElement(TenPlantsIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.EPIC },
    { id: 'ach5', code: 'FIRST_FERTILIZE', name: 'Забота о питании', description: 'Удобрить растение', icon: React.createElement(FirstFertilizeIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.COMMON },
    { id: 'ach6', code: 'FIRST_REPOT', name: 'Новый дом', description: 'Пересадить растение', icon: React.createElement(FirstRepotIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.RARE },
    { id: 'ach7', code: 'FIRST_TRIM', name: 'Парикмахер', description: 'Обрезать растение', icon: React.createElement(FirstTrimIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.COMMON },
    { id: 'ach8', code: 'FIRST_COMMUNITY', name: 'Социальный садовод', description: 'Вступить в сообщество', icon: React.createElement(FirstCommunityIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.COMMON },
    { id: 'ach9', code: 'WATERING_MASTER', name: 'Мастер полива', description: 'Полить растения 50 раз', icon: React.createElement(WateringMasterIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.EPIC },
    { id: 'ach10', code: 'FIRST_FRIEND', name: 'Ты мне друг?', description: 'Добавить первого друга', icon: React.createElement(FirstFriendIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.COMMON },
    { id: 'ach11', code: 'COMMUNITY_FOUNDER', name: 'Лидер', description: 'Создать свое сообщество', icon: React.createElement(CommunityFounderIcon, { className: "w-8 h-8" }), rarity: AchievementRarity.LEGENDARY },
];

const MOCK_STATS: Stats = {
    userId: 'user1',
    totalWaterings: 24,
    totalFertilizes: 5,
    totalRepots: 2,
    totalTrims: 3,
    streakWater: 5,
    totalActions: 34,
};

const MOCK_LEVEL_INFO: LevelInfo = {
    userId: 'user1',
    xp: 450,
    level: 3,
    levelName: XP_LEVELS[2].name,
    levelIcon: XP_LEVELS[2].icon,
    nextLevelXp: XP_LEVELS[3].minXp,
    progressPercentage: ((450 - 300) / (700 - 300)) * 100,
};

const MOCK_CARE_EVENTS: CareEvent[] = [
    { id: 'evt1', userId: 'user1', plantId: 'plant1', type: CareType.WATER, occurredAt: daysAgo(3), createdAt: daysAgo(3) },
    { id: 'evt2', userId: 'user1', plantId: 'plant1', type: CareType.FERTILIZE, occurredAt: daysAgo(20), createdAt: daysAgo(20) },
];

export const useMockData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User>(ALL_MOCK_USERS[0]);
    const [plants, setPlants] = useState<Plant[]>(MOCK_PLANTS_DATA);
    const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(MOCK_POSTS);
    const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
    const [careEvents, setCareEvents] = useState<CareEvent[]>(MOCK_CARE_EVENTS);
    const [achievements, setAchievements] = useState<(Achievement & { earnedAt?: Date })[]>(
        MOCK_ACHIEVEMENTS.map(a => {
            if (a.code === 'FIRST_PLANT' || a.code === 'FIRST_WATER') {
                return { ...a, earnedAt: daysAgo(10) };
            }
            return a;
        })
    );
    const [stats, setStats] = useState<Stats>(MOCK_STATS);
    const [levelInfo, setLevelInfo] = useState<LevelInfo>(MOCK_LEVEL_INFO);
    const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set(['post3']));
    const [pendingNotifications, setPendingNotifications] = useState<Notification[]>([]);
    
    // Friend Request Logic
    const [pendingFriendRequests, setPendingFriendRequests] = useState<User[]>([
        {
             id: 'user_req_1',
             name: 'Мария',
             photoUrl: 'https://i.pravatar.cc/150?u=maria',
             gender: 'female',
             age: 26,
             telegramUsername: 'maria_garden',
             about: 'Начинающий садовод',
             friends: []
        }
    ]);
    
    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const retryFetch = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    // --- Actions ---

    const getUserById = useCallback((id: string) => {
        // Search in main user, friends, post authors, etc.
        if (user.id === id) return user;
        const friend = user.friends.find(f => f.id === id);
        if (friend) {
            // Find full user data if available, otherwise mock it from friend data
            const fullUser = ALL_MOCK_USERS.find(u => u.id === id);
            return fullUser || { 
                id: friend.id, name: friend.name, photoUrl: friend.photoUrl, 
                gender: 'female', age: 25, about: 'Друг', friends: [] 
            } as User;
        }
        return ALL_MOCK_USERS.find(u => u.id === id);
    }, [user, ALL_MOCK_USERS]);

    const getFriendPlants = useCallback(async (friendId: string) => {
        // Mock implementation to return empty or random plants for friends
        return [];
    }, []);

    const addPlant = useCallback((plantData: Omit<Plant, 'id' | 'createdAt'>) => {
        const newPlant: Plant = {
            ...plantData,
            id: uuid(),
            createdAt: new Date(),
        };
        setPlants(prev => [...prev, newPlant]);
        
        // Check achievement: FIRST_PLANT
        checkAchievement('FIRST_PLANT');
        if (plants.length + 1 >= 5) checkAchievement('FIVE_PLANTS');
        if (plants.length + 1 >= 10) checkAchievement('TEN_PLANTS');

        addXp(20);
    }, [plants]);

    const updatePlant = useCallback((plantId: string, updatedData: Partial<Omit<Plant, 'id'>>) => {
        setPlants(prev => prev.map(p => p.id === plantId ? { ...p, ...updatedData } : p));
    }, []);

    const deletePlant = useCallback((plantId: string) => {
        setPlants(prev => prev.filter(p => p.id !== plantId));
    }, []);

    const logCareEvent = useCallback((plantId: string, type: CareType, note?: string, photoUrl?: string) => {
        const newEvent: CareEvent = {
            id: uuid(),
            userId: user.id,
            plantId,
            type,
            note,
            photoUrl,
            occurredAt: new Date(),
            createdAt: new Date(),
        };
        setCareEvents(prev => [newEvent, ...prev]);

        // Update Plant state
        setPlants(prev => prev.map(p => {
            if (p.id !== plantId) return p;
            const updates: Partial<Plant> = {};
            if (type === CareType.WATER) updates.lastWateredAt = new Date();
            if (type === CareType.FERTILIZE) {
                updates.lastFertilizedAt = new Date();
                updates.nextFertilizingDate = daysFromNow(30); // simplistic next date
            }
            if (type === CareType.REPOT) {
                 updates.lastRepottedAt = new Date();
                 updates.nextRepottingDate = daysFromNow(365);
            }
            if (type === CareType.TRIM) {
                updates.lastTrimmedAt = new Date();
                updates.nextTrimmingDate = daysFromNow(90);
            }
            return { ...p, ...updates };
        }));

        // Update Stats
        setStats(prev => ({
            ...prev,
            totalWaterings: type === CareType.WATER ? prev.totalWaterings + 1 : prev.totalWaterings,
            totalFertilizes: type === CareType.FERTILIZE ? prev.totalFertilizes + 1 : prev.totalFertilizes,
            totalRepots: type === CareType.REPOT ? prev.totalRepots + 1 : prev.totalRepots,
            totalTrims: type === CareType.TRIM ? prev.totalTrims + 1 : prev.totalTrims,
            totalActions: prev.totalActions + 1,
        }));

        // XP and Achievements
        const xpGain = CARE_XP_REWARDS[type];
        addXp(xpGain);

        if (type === CareType.WATER) checkAchievement('FIRST_WATER');
        if (type === CareType.FERTILIZE) checkAchievement('FIRST_FERTILIZE');
        if (type === CareType.REPOT) checkAchievement('FIRST_REPOT');
        if (type === CareType.TRIM) checkAchievement('FIRST_TRIM');

        if (stats.totalWaterings + 1 >= 50) checkAchievement('WATERING_MASTER');

    }, [user.id, stats]);

    const checkAchievement = (code: string) => {
        setAchievements(prev => {
            const achievement = prev.find(a => a.code === code);
            if (achievement && !achievement.earnedAt) {
                 setPendingNotifications(current => [
                    ...current,
                    {
                        id: uuid(),
                        message: `Достижение разблокировано: ${achievement.name}`,
                        icon: React.createElement(StarIcon, { className: "w-5 h-5 text-yellow-500" })
                    }
                ]);
                return prev.map(a => a.code === code ? { ...a, earnedAt: new Date() } : a);
            }
            return prev;
        });
    };

    const addXp = (amount: number) => {
        setLevelInfo(prev => {
            let newXp = prev.xp + amount;
            let newLevel = prev.level;
            
            // Find current level based on XP
            const currentLevelObj = XP_LEVELS.slice().reverse().find(l => newXp >= l.minXp) || XP_LEVELS[0];
            newLevel = currentLevelObj.level;
            
            // Find next level info
            const nextLevelObj = XP_LEVELS.find(l => l.level === newLevel + 1);
            const nextLevelXp = nextLevelObj ? nextLevelObj.minXp : prev.nextLevelXp;
            
            // Calculate progress
            const currentLevelMinXp = currentLevelObj.minXp;
            const progress = nextLevelObj 
                ? ((newXp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp)) * 100 
                : 100;

            return {
                ...prev,
                xp: newXp,
                level: newLevel,
                levelName: currentLevelObj.name,
                levelIcon: currentLevelObj.icon,
                nextLevelXp,
                progressPercentage: Math.min(100, Math.max(0, progress)),
            };
        });
    };

    const updateUser = useCallback((updatedData: User) => {
        setUser(updatedData);
    }, []);

    const joinCommunity = useCallback((communityId: string) => {
        setCommunities(prev => prev.map(c => 
            c.id === communityId ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c
        ));
        checkAchievement('FIRST_COMMUNITY');
    }, []);

    const leaveCommunity = useCallback((communityId: string) => {
        setCommunities(prev => prev.map(c => 
            c.id === communityId ? { ...c, isMember: false, memberCount: Math.max(0, c.memberCount - 1) } : c
        ));
    }, []);

    const createCommunity = useCallback((data: Omit<Community, 'id' | 'memberCount' | 'isMember'>) => {
        const newCommunity: Community = {
            id: uuid(),
            ...data,
            memberCount: 1,
            isMember: true,
        };
        setCommunities(prev => [newCommunity, ...prev]);
        checkAchievement('COMMUNITY_FOUNDER');
    }, []);

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
        addXp(5);
    }, [user]);

    const updatePost = useCallback((postId: string, data: { text: string; photoUrl?: string }) => {
        setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, ...data } : p));
    }, []);

    const deletePost = useCallback((postId: string) => {
        setCommunityPosts(prev => prev.filter(p => p.id !== postId));
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
        addXp(2);
    }, [user]);

    const fetchComments = useCallback((postId: string) => {
        // Mock implementation
    }, []);

    const toggleLikePost = useCallback((postId: string) => {
        setLikedPostIds(prev => {
            const newSet = new Set(prev);
            const isLiked = newSet.has(postId);
            if (isLiked) {
                newSet.delete(postId);
                setCommunityPosts(posts => posts.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
            } else {
                newSet.add(postId);
                setCommunityPosts(posts => posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
            }
            return newSet;
        });
    }, []);

    const searchUserByTelegram = useCallback((username: string) => {
        const cleanUsername = username.replace('@', '').toLowerCase();
        return ALL_MOCK_USERS.find(u => 
            (u.telegramUsername || '').toLowerCase() === cleanUsername
        ) || null;
    }, []);

    const addFriend = useCallback((friendUser: User) => {
        // In real app, send request. Here, just add to friends directly for simplicity or mock request?
        // Requirement says "addFriend", let's assume it sends a request or instantly adds if it's a mock.
        // Let's assume instant for MOCK purposes unless it matches specific logic.
        
        setUser(prev => {
            if (prev.friends.some(f => f.id === friendUser.id)) return prev;
            return {
                ...prev,
                friends: [...prev.friends, { id: friendUser.id, name: friendUser.name, photoUrl: friendUser.photoUrl }]
            };
        });
        checkAchievement('FIRST_FRIEND');
         setPendingNotifications(current => [
            ...current,
            {
                id: uuid(),
                message: `Вы подружились с ${friendUser.name}`,
                icon: React.createElement(FirstFriendIcon, { className: "w-5 h-5 text-green-500" })
            }
        ]);
    }, []);

    const removeFriend = useCallback((friendId: string) => {
        setUser(prev => ({
            ...prev,
            friends: prev.friends.filter(f => f.id !== friendId)
        }));
    }, []);

    const handleFriendRequestAction = useCallback((requestingUser: User, accept: boolean) => {
        setPendingFriendRequests(prev => prev.filter(u => u.id !== requestingUser.id));
        if (accept) {
            addFriend(requestingUser);
        }
    }, [addFriend]);
    
    const clearPendingNotifications = useCallback(() => {
        setPendingNotifications([]);
    }, []);

    const fetchCommunityPosts = useCallback((communityId: string) => {
        // Mock implementation: do nothing as data is local
    }, []);

    return {
        isLoading,
        error,
        user,
        plants,
        communities,
        communityPosts,
        comments,
        careEvents,
        achievements,
        stats,
        levelInfo,
        likedPostIds,
        pendingNotifications,
        pendingFriendRequests,
        getUserById,
        getFriendPlants,
        addPlant,
        updatePlant,
        deletePlant,
        logCareEvent,
        updateUser,
        joinCommunity,
        leaveCommunity,
        createCommunity,
        addPost,
        updatePost,
        deletePost,
        addComment,
        fetchComments,
        toggleLikePost,
        searchUserByTelegram,
        addFriend,
        removeFriend,
        handleFriendRequestAction,
        clearPendingNotifications,
        fetchCommunityPosts,
        retryFetch
    };
};