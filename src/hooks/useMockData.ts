
import React, { useState, useCallback, useEffect } from 'react';
import {
  Plant, User, LevelInfo, Achievement, CareType, Notification
} from '../types';
import { XP_LEVELS, MASTER_ACHIEVEMENTS } from '../constants';
import {
    StarIcon, FirstPlantIcon, FirstFriendIcon, CheckIcon
} from '../components/icons';
import { api } from '../services/api';
import { triggerHaptic } from '../utils';

// --- HELPERS ---
const uuid = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const MOCK_LEVEL_INFO: LevelInfo = {
    userId: 'user1',
    xp: 0,
    level: 1,
    levelName: XP_LEVELS[0].name,
    levelIcon: XP_LEVELS[0].icon,
    nextLevelXp: XP_LEVELS[1].minXp,
    progressPercentage: 0,
};

// Initial empty user
const INITIAL_USER: User = {
    id: 'loading',
    name: 'Загрузка...',
    photoUrl: 'https://placehold.co/150',
    gender: 'female',
    age: 0,
    about: '',
    friends: [],
    aiRequestsCount: 0
};

// Renamed to useAppData to reflect real data source
export const useAppData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [marketItems, setMarketItems] = useState<Plant[]>([]);
    const [achievements, setAchievements] = useState<(Achievement & { earnedAt?: Date })[]>([]);
    const [levelInfo, setLevelInfo] = useState<LevelInfo>(MOCK_LEVEL_INFO);
    const [pendingNotifications, setPendingNotifications] = useState<Notification[]>([]);
    const [pendingFriendRequests, setPendingFriendRequests] = useState<User[]>([]);

    // --- REAL API INTEGRATION ---
    const fetchData = useCallback(async (isInitial = false) => {
        if (isInitial) {
            setIsLoading(true);
        }
        setError(null);
        try {
            // Load essential data in parallel
            // No artificial delays
            const [userData, plantsData, marketData, friendRequests] = await Promise.all([
                api.getProfile(),
                api.getPlants(),
                api.getMarket(),
                api.getFriendRequests()
            ]);
            
            setUser(userData);
            
            // Calculate Level Info based on XP from backend
            const currentXp = userData.xp || 0;
            const currentLevel = XP_LEVELS.slice().reverse().find(l => currentXp >= l.minXp) || XP_LEVELS[0];
            const nextLevelObj = XP_LEVELS.find(l => l.level === currentLevel.level + 1);
            const nextLevelXp = nextLevelObj ? nextLevelObj.minXp : currentLevel.minXp * 2;
            const progress = nextLevelObj 
                ? ((currentXp - currentLevel.minXp) / (nextLevelXp - currentLevel.minXp)) * 100 
                : 100;

            setLevelInfo({
                userId: userData.id,
                xp: currentXp,
                level: currentLevel.level,
                levelName: currentLevel.name,
                levelIcon: currentLevel.icon,
                nextLevelXp: nextLevelXp,
                progressPercentage: Math.max(0, Math.min(100, progress))
            });

            setPlants(plantsData);
            setMarketItems(marketData);
            setPendingFriendRequests(friendRequests);
            
            // Merge User Achievements with Master List
            const userEarnedMap = new Map();
            if ((userData as any).achievements) {
                (userData as any).achievements.forEach((ua: any) => {
                    const code = ua.achievement ? ua.achievement.code : ua.code;
                    userEarnedMap.set(code, ua.earnedAt);
                });
            }

            const allAchievements = MASTER_ACHIEVEMENTS.map(ach => ({
                ...ach,
                earnedAt: userEarnedMap.get(ach.code) // Will be undefined if not earned
            }));
            
            setAchievements(allAchievements);

        } catch (err: any) {
            console.error("Failed to fetch initial data", err);
            if (isInitial) {
                setError(err.message || "Не удалось загрузить данные. Проверьте соединение.");
            }
        } finally {
            if (isInitial) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    // --- Actions ---

    const getUser = useCallback(async (id: string) => {
        if (user.id === id) return user;
        try {
            return await api.getUser(id);
        } catch (e) {
            console.error("Failed to fetch user", e);
            return null;
        }
    }, [user]);
    
    const getFriendPlants = useCallback(async (userId: string) => {
        try {
            return await api.getUserPlants(userId);
        } catch (e) {
            console.error("Failed to get friend plants", e);
            return [];
        }
    }, []);

    const showErrorToast = (msg: string) => {
        triggerHaptic('error');
        setPendingNotifications(current => [
            ...current,
            {
                id: uuid(),
                message: msg,
                icon: React.createElement('span', { className: "text-xl" }, "⚠️")
            }
        ]);
    };

    // --- PLANTS ---
    const addPlant = useCallback(async (plantData: any) => {
        try {
            const newPlant = await api.addPlant(plantData);
            
            if (newPlant.isForSale) {
                 setMarketItems(prev => [newPlant, ...prev]);
                 setPendingNotifications(current => [
                    ...current,
                    {
                        id: uuid(),
                        message: `Объявление "${newPlant.name}" опубликовано!`,
                        icon: React.createElement(FirstPlantIcon, { className: "w-5 h-5 text-blue-500" })
                    }
                ]);
            } else {
                setPlants(prev => [newPlant, ...prev]);
                setPendingNotifications(current => [
                    ...current,
                    {
                        id: uuid(),
                        message: `Растение "${newPlant.name}" добавлено!`,
                        icon: React.createElement(FirstPlantIcon, { className: "w-5 h-5 text-green-500" })
                    }
                ]);
            }
            
            triggerHaptic('success');
            fetchData(false);
        } catch (e: any) {
            console.error("Add plant failed", e);
            showErrorToast(e.message || "Не удалось добавить растение");
        }
    }, [fetchData]);

    const updatePlant = useCallback(async (plantId: string, updatedData: Partial<Omit<Plant, 'id'>> | FormData) => {
        try {
            const updatedPlant = await api.updatePlant(plantId, updatedData);
            setPlants(prev => prev.map(p => p.id === plantId ? updatedPlant : p));
            setMarketItems(prev => prev.map(p => p.id === plantId ? updatedPlant : p));
            
            if (updatedData instanceof FormData && updatedData.has('photo')) {
                fetchData(false);
            }
        } catch (e: any) {
            console.error("Update failed", e);
            showErrorToast(e.message || "Не удалось обновить растение");
        }
    }, [fetchData]);

    const deletePlant = useCallback(async (plantId: string) => {
        try {
            await api.deletePlant(plantId);
            setPlants(prev => prev.filter(p => p.id !== plantId));
            setMarketItems(prev => prev.filter(p => p.id !== plantId));
        } catch (e: any) {
            console.error("Delete failed", e);
            showErrorToast(e.message || "Не удалось удалить растение");
        }
    }, []);

    const logCareEvent = useCallback(async (plantId: string, type: CareType, note?: string, photoUrl?: string) => {
        try {
            // @ts-ignore
            const result = await api.logCare(plantId, type, note);
            
            if (result.updatedPlant) {
                setPlants(prev => prev.map(p => p.id === plantId ? result.updatedPlant : p));
            }

            if (result.xpGained === 0) {
                triggerHaptic('warning');
                setPendingNotifications(prev => [...prev, {
                    id: uuid(),
                    message: `Уход уже записан сегодня. Опыт не начислен.`,
                    icon: React.createElement(CheckIcon, { className: "w-5 h-5 text-gray-500" })
                }]);
            } else if (result.xpGained && result.xpGained > 0) {
                setPendingNotifications(prev => [...prev, {
                    id: uuid(),
                    message: `Уход записан! +${result.xpGained} XP`,
                    icon: React.createElement(CheckIcon, { className: "w-5 h-5 text-green-500" })
                }]);
                fetchData(false);
            }

            if (result.userStats) {
                const { xp, level, leveledUp } = result.userStats;
                const currentLevel = XP_LEVELS.slice().reverse().find(l => xp >= l.minXp) || XP_LEVELS[0];
                const nextLevelObj = XP_LEVELS.find(l => l.level === currentLevel.level + 1);
                const nextLevelXp = nextLevelObj ? nextLevelObj.minXp : currentLevel.minXp * 2;
                const progress = nextLevelObj 
                    ? ((xp - currentLevel.minXp) / (nextLevelXp - currentLevel.minXp)) * 100 
                    : 100;
                
                setLevelInfo({
                    userId: user.id,
                    xp,
                    level,
                    levelName: currentLevel.name,
                    levelIcon: currentLevel.icon,
                    nextLevelXp,
                    progressPercentage: progress
                });
                
                if (leveledUp) {
                    triggerHaptic('success');
                    setPendingNotifications(prev => [...prev, {
                        id: uuid(),
                        message: `Новый уровень: ${currentLevel.name}!`,
                        icon: React.createElement(StarIcon, { className: "w-5 h-5 text-yellow-500" })
                    }]);
                }
            }
        } catch (e: any) {
            console.error("Log care failed", e);
            showErrorToast(e.message || "Ошибка записи ухода");
        }
    }, [user.id, fetchData]);

    // --- USER ---
    const updateUser = useCallback(async (updatedData: any) => {
        try {
            const updatedUser = await api.updateProfile(updatedData);
            setUser(updatedUser);
        } catch (e: any) {
            console.error("Profile update failed", e);
            showErrorToast(e.message || "Не удалось обновить профиль");
        }
    }, []);

    const deleteAccount = useCallback(async () => {
        try {
            await api.deleteAccount();
            window.location.reload();
        } catch (e: any) {
            console.error("Delete account failed", e);
            showErrorToast(e.message || "Не удалось удалить аккаунт");
        }
    }, []);

    const searchUserByTelegram = useCallback(async (username: string) => {
         try {
             const users = await api.searchUsers(username);
             return users.length > 0 ? users[0] : null;
         } catch (e) {
             return null;
         }
    }, []);

    // Friends
    const addFriend = useCallback(async (friendUser: User) => {
        try {
            await api.sendFriendRequest(friendUser.id);
            setPendingNotifications(current => [
                ...current,
                {
                    id: uuid(),
                    message: `Заявка в друзья отправлена ${friendUser.name}`,
                    icon: React.createElement(FirstFriendIcon, { className: "w-5 h-5 text-blue-500" })
                }
            ]);
        } catch (e: any) {
            console.error("Add friend failed", e);
            showErrorToast(e.message || "Ошибка отправки заявки");
        }
    }, []);

    const removeFriend = useCallback(async (friendId: string) => {
        try {
            await api.removeFriend(friendId);
            setUser(prev => ({
                ...prev,
                friends: prev.friends.filter(f => f.id !== friendId)
            }));
        } catch (e: any) {
             console.error("Remove friend failed", e);
             showErrorToast(e.message || "Не удалось удалить друга");
        }
    }, []);

    const handleFriendRequestAction = useCallback(async (requestingUser: User, accept: boolean) => {
        try {
            const requestId = requestingUser.requestId;
            if (!requestId) return;

            await api.respondToFriendRequest(requestId, accept ? 'ACCEPT' : 'REJECT');
            
            setPendingFriendRequests(prev => prev.filter(u => u.id !== requestingUser.id));
            
            if (accept) {
                fetchData(false); 
                triggerHaptic('success');
                setPendingNotifications(current => [
                    ...current,
                    {
                        id: uuid(),
                        message: `Вы теперь друзья с ${requestingUser.name}`,
                        icon: React.createElement(FirstFriendIcon, { className: "w-5 h-5 text-green-500" })
                    }
                ]);
            }
        } catch (e: any) {
            console.error("Respond friend request failed", e);
            showErrorToast(e.message || "Ошибка обработки заявки");
        }
    }, [fetchData]);
    
    const clearPendingNotifications = useCallback(() => {
        setPendingNotifications([]);
    }, []);

    return {
        isLoading,
        error,
        user,
        plants,
        marketItems,
        achievements,
        levelInfo,
        pendingNotifications,
        pendingFriendRequests,
        getUser,
        getFriendPlants,
        addPlant,
        updatePlant,
        deletePlant,
        logCareEvent,
        updateUser,
        deleteAccount,
        searchUserByTelegram,
        addFriend,
        removeFriend,
        handleFriendRequestAction,
        clearPendingNotifications,
        retryFetch: () => fetchData(true)
    };
};
