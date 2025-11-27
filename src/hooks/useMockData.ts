
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
import { api } from '../services/api';

// --- HELPERS ---
const uuid = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const MOCK_LEVEL_INFO: LevelInfo = {
    userId: 'user1',
    xp: 0,
    level: 1,
    levelName: XP_LEVELS[0].name,
    levelIcon: XP_LEVELS[0].icon,
    nextLevelXp: XP_LEVELS[1].minXp,
    progressPercentage: 0,
};

// Initial empty user to avoid null checks before first load
const INITIAL_USER: User = {
    id: 'loading',
    name: 'Загрузка...',
    photoUrl: 'https://placehold.co/150',
    gender: 'female',
    age: 0,
    about: '',
    friends: []
};

export const useMockData = () => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [careEvents, setCareEvents] = useState<CareEvent[]>([]);
    const [achievements, setAchievements] = useState<(Achievement & { earnedAt?: Date })[]>([]);
    const [stats, setStats] = useState<Stats>({ 
        userId: 'user1', totalWaterings: 0, totalFertilizes: 0, totalRepots: 0, totalTrims: 0, streakWater: 0, totalActions: 0 
    });
    const [levelInfo, setLevelInfo] = useState<LevelInfo>(MOCK_LEVEL_INFO);
    const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
    const [pendingNotifications, setPendingNotifications] = useState<Notification[]>([]);
    const [pendingFriendRequests, setPendingFriendRequests] = useState<User[]>([]);

    // --- REAL API INTEGRATION ---
    const fetchData = useCallback(async () => {
        try {
            // Load essential data
            const [userData, plantsData, communitiesData, friendRequests] = await Promise.all([
                api.getProfile(),
                api.getPlants(),
                api.getCommunities(),
                api.getFriendRequests()
            ]);
            
            setUser(userData);
            
            // Map Backend Stats to Frontend Stats
            if (userData.stats) {
                setStats(userData.stats);
            }

            // Load Care History
            if ((userData as any).careEvents) {
                setCareEvents((userData as any).careEvents);
            }
            
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
            setCommunities(communitiesData);
            setPendingFriendRequests(friendRequests);
            
            // Achievements
            if ((userData as any).achievements) {
                const earned = (userData as any).achievements.map((ua: any) => ({
                     ...ua.achievement,
                     earnedAt: ua.earnedAt
                }));
                setAchievements(earned);
            }

        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Actions ---

    const getUserById = useCallback((id: string) => {
        if (user.id === id) return user;
        const friend = user.friends.find(f => f.id === id);
        // If it's a friend, return basic info if full info isn't available
        return friend ? { ...friend, friends: [], gender: 'female', age: 25, about: 'Friend' } as User : user;
    }, [user]);
    
    // FETCH FRIEND PLANTS (API)
    const getFriendPlants = useCallback(async (userId: string) => {
        try {
            return await api.getUserPlants(userId);
        } catch (e) {
            console.error("Failed to get friend plants", e);
            return [];
        }
    }, []);

    // --- PLANTS ---
    const addPlant = useCallback(async (plantData: any) => {
        // Optimistic update or refresh
        setPlants(prev => [plantData, ...prev]);
        fetchData(); // Refresh profile stats/XP
        
        setPendingNotifications(current => [
            ...current,
            {
                id: uuid(),
                message: `Растение "${plantData.name}" добавлено!`,
                icon: React.createElement(FirstPlantIcon, { className: "w-5 h-5 text-green-500" })
            }
        ]);
    }, [fetchData]);

    const updatePlant = useCallback(async (plantId: string, updatedData: Partial<Omit<Plant, 'id'>> | FormData) => {
        try {
            const updatedPlant = await api.updatePlant(plantId, updatedData);
            setPlants(prev => prev.map(p => p.id === plantId ? updatedPlant : p));
        } catch (e) {
            console.error("Update failed", e);
        }
    }, []);

    const deletePlant = useCallback(async (plantId: string) => {
        try {
            await api.deletePlant(plantId);
            setPlants(prev => prev.filter(p => p.id !== plantId));
        } catch (e) {
            console.error("Delete failed", e);
        }
    }, []);

    const logCareEvent = useCallback(async (plantId: string, type: CareType, note?: string, photoUrl?: string) => {
        try {
            const result = await api.logCare(plantId, type, note);
            
            // Update local care events list immediately
            if (result.careEvent) {
                setCareEvents(prev => [result.careEvent, ...prev]);
            }

            // Refresh plants to get updated dates
            const updatedPlants = await api.getPlants();
            setPlants(updatedPlants);

            // Update stats and level
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
                
                setStats(prev => ({
                    ...prev,
                    totalActions: prev.totalActions + 1,
                    totalWaterings: type === CareType.WATER ? prev.totalWaterings + 1 : prev.totalWaterings,
                    totalFertilizes: type === CareType.FERTILIZE ? prev.totalFertilizes + 1 : prev.totalFertilizes,
                    totalRepots: type === CareType.REPOT ? prev.totalRepots + 1 : prev.totalRepots,
                    totalTrims: type === CareType.TRIM ? prev.totalTrims + 1 : prev.totalTrims,
                }));

                if (leveledUp) {
                    setPendingNotifications(prev => [...prev, {
                        id: uuid(),
                        message: `Новый уровень: ${currentLevel.name}!`,
                        icon: React.createElement(StarIcon, { className: "w-5 h-5 text-yellow-500" })
                    }]);
                }
            }
        } catch (e) {
            console.error("Log care failed", e);
        }
    }, [user.id]);

    // --- USER ---
    const updateUser = useCallback(async (updatedData: any) => {
        try {
            const result = await api.updateProfile(updatedData);
            // Result is the updated user from backend with canonical data (names, url)
            setUser(result);
        } catch (e) {
            console.error("Profile update failed", e);
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

    // Send Request
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
        } catch (e) {
            console.error("Add friend failed", e);
            alert("Не удалось отправить заявку. Возможно, вы уже друзья или заявка отправлена.");
        }
    }, []);

    const removeFriend = useCallback(async (friendId: string) => {
        try {
            await api.removeFriend(friendId);
            setUser(prev => ({
                ...prev,
                friends: prev.friends.filter(f => f.id !== friendId)
            }));
        } catch (e) {
             console.error("Remove friend failed", e);
        }
    }, []);

    // Accept/Reject Request
    const handleFriendRequestAction = useCallback(async (requestingUser: User, accept: boolean) => {
        try {
            // @ts-ignore - requestId attached in backend mapper
            const requestId = requestingUser.requestId;
            if (!requestId) return;

            await api.respondToFriendRequest(requestId, accept ? 'ACCEPT' : 'REJECT');
            
            setPendingFriendRequests(prev => prev.filter(u => u.id !== requestingUser.id));
            
            if (accept) {
                // Refresh user data to get updated friends list
                fetchData(); 
                setPendingNotifications(current => [
                    ...current,
                    {
                        id: uuid(),
                        message: `Вы теперь друзья с ${requestingUser.name}`,
                        icon: React.createElement(FirstFriendIcon, { className: "w-5 h-5 text-green-500" })
                    }
                ]);
            }
        } catch (e) {
            console.error("Respond friend request failed", e);
        }
    }, [fetchData]);

    // --- COMMUNITIES ---
    const fetchCommunityPosts = useCallback(async (communityId: string) => {
        try {
             const posts = await api.getPosts(communityId);
             setCommunityPosts(prev => {
                 // Remove existing posts for this community to avoid dups
                 const others = prev.filter(p => p.communityId !== communityId);
                 return [...others, ...posts];
             });
             
             const liked = new Set<string>();
             posts.forEach(p => {
                 // @ts-ignore
                 if (p.isLiked) liked.add(p.id);
             });
             setLikedPostIds(prev => new Set([...prev, ...liked]));
        } catch (e) {
            console.error("Fetch posts failed", e);
        }
    }, []);

    const joinCommunity = useCallback(async (communityId: string) => {
        try {
            await api.joinCommunity(communityId);
            setCommunities(prev => prev.map(c => 
                c.id === communityId ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c
            ));
            fetchCommunityPosts(communityId);
        } catch (e) {
             console.error("Join community failed", e);
        }
    }, [fetchCommunityPosts]);

    const leaveCommunity = useCallback(async (communityId: string) => {
        try {
            await api.leaveCommunity(communityId);
            setCommunities(prev => prev.map(c => 
                c.id === communityId ? { ...c, isMember: false, memberCount: Math.max(0, c.memberCount - 1) } : c
            ));
        } catch (e) {
             console.error("Leave community failed", e);
        }
    }, []);

    const createCommunity = useCallback(async (formData: any) => {
        try {
            const newCommunity = await api.createCommunity(formData);
            setCommunities(prev => [newCommunity, ...prev]);
            setPendingNotifications(current => [
                ...current,
                {
                    id: uuid(),
                    message: `Сообщество "${newCommunity.name}" создано!`,
                    icon: React.createElement(CommunityFounderIcon, { className: "w-5 h-5 text-blue-500" })
                }
            ]);
        } catch (e) {
             console.error("Create community failed", e);
        }
    }, []);

    // --- POSTS ---
    const addPost = useCallback(async (communityId: string, formData: any) => {
        try {
            const newPost = await api.createPost(communityId, formData);
            setCommunityPosts(prev => [newPost, ...prev]);
        } catch (e) {
             console.error("Create post failed", e);
        }
    }, []);

    const updatePost = useCallback(async (postId: string, formData: any) => {
        try {
            const updated = await api.updatePost(postId, formData);
            setCommunityPosts(prev => prev.map(p => p.id === postId ? updated : p));
        } catch (e) {
             console.error("Update post failed", e);
        }
    }, []);

    const deletePost = useCallback(async (postId: string) => {
        try {
            await api.deletePost(postId);
            setCommunityPosts(prev => prev.filter(p => p.id !== postId));
        } catch (e) {
            console.error("Delete post failed", e);
        }
    }, []);

    const addComment = useCallback(async (postId: string, text: string) => {
        try {
            const newComment = await api.addComment(postId, text);
            setComments(prev => [...prev, newComment]);
            setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
        } catch (e) {
             console.error("Add comment failed", e);
        }
    }, []);
    
    // FETCH COMMENTS (API)
    const fetchComments = useCallback(async (postId: string) => {
        try {
            const fetchedComments = await api.getComments(postId);
            setComments(prev => {
                // Ensure we replace comments for this post with fresh ones
                const others = prev.filter(c => c.postId !== postId);
                return [...others, ...fetchedComments];
            });
        } catch (e) {
            console.error("Fetch comments failed", e);
        }
    }, []);

    const toggleLikePost = useCallback(async (postId: string) => {
        try {
            // Optimistic Update
            const wasLiked = likedPostIds.has(postId);
            setLikedPostIds(prev => {
                const newSet = new Set(prev);
                if (wasLiked) newSet.delete(postId);
                else newSet.add(postId);
                return newSet;
            });
            setCommunityPosts(posts => posts.map(p => p.id === postId ? { ...p, likes: p.likes + (wasLiked ? -1 : 1) } : p));

            // API Call
            await api.toggleLike(postId);
        } catch (e) {
            console.error("Like failed", e);
        }
    }, [likedPostIds]);
    
    const clearPendingNotifications = useCallback(() => {
        setPendingNotifications([]);
    }, []);

    return {
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
        fetchCommunityPosts
    };
};
