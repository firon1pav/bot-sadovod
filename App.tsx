

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import PlantCard from './components/PlantCard';
import CalendarScreen from './components/CalendarScreen';
import ProfileScreen from './components/ProfileScreen';
import PlantDetailScreen from './components/PlantDetailScreen';
import AddPlantModal from './components/AddPlantModal';
import CommunityDetailScreen from './components/CommunityDetailScreen';
import NotificationToast from './components/NotificationToast';
import FriendProfileScreen from './components/FriendProfileScreen';
// @ts-ignore
import confetti from 'canvas-confetti';

import { useMockData } from './hooks/useMockData';
import { Plant, Community, CareType, Notification, User } from './types';
import { PlusIcon, WaterDropIcon, FertilizerIcon, SpadeIcon, ScissorsIcon, BellIcon } from './components/icons';
import { CARE_TYPE_RUSSIAN } from './utils';

// --- Route Wrappers ---

const PlantDetailRoute = ({ plants, onUpdatePlant, onLogCareEvent, onDeletePlant }: any) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const plant = plants.find((p: Plant) => p.id === id);

    if (!plant) return <Navigate to="/" replace />;

    return (
        <PlantDetailScreen
            plant={plant}
            onBack={() => navigate(-1)}
            onUpdatePlant={onUpdatePlant}
            onLogCareEvent={onLogCareEvent}
            onDeletePlant={(plantId) => {
                onDeletePlant(plantId);
                navigate('/');
            }}
        />
    );
};

const CommunityDetailRoute = ({ communities, communityPosts, comments, user, leaveCommunity, joinCommunity, addPost, updatePost, deletePost, addComment, likedPostIds, toggleLikePost, addNotification, timeAgo }: any) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const community = communities.find((c: Community) => c.id === id);

    if (!community) return <Navigate to="/profile" replace />;

    return (
        <CommunityDetailScreen
            community={community}
            posts={communityPosts.filter((p: any) => p.communityId === community.id)}
            comments={comments}
            currentUser={user}
            onBack={() => navigate(-1)}
            onLeaveCommunity={(cid) => {
                 leaveCommunity(cid);
                 navigate('/profile'); 
            }}
            onJoinCommunity={joinCommunity}
            onAddPost={addPost}
            onUpdatePost={updatePost}
            onDeletePost={deletePost}
            onAddComment={addComment}
            likedPostIds={likedPostIds}
            toggleLikePost={toggleLikePost}
            addNotification={addNotification}
            timeAgo={timeAgo}
        />
    );
};

const FriendProfileRoute = ({ getUserById, plants, levelInfo, removeFriend }: any) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const friend = getUserById(id);

    if (!friend) return <Navigate to="/profile" replace />;

    return (
        <FriendProfileScreen
            friend={friend}
            plants={plants.filter((p: Plant) => p.userId === friend.id)}
            levelInfo={levelInfo}
            onBack={() => navigate(-1)}
            onRemoveFriend={(fid) => {
                removeFriend(fid);
                navigate('/profile');
            }}
        />
    );
};


// --- Main App Content ---

const AppContent: React.FC = () => {
    const {
        plants, user, stats, levelInfo, achievements, communities, communityPosts, comments, careEvents,
        likedPostIds, toggleLikePost, getUserById, pendingNotifications, clearPendingNotifications,
        addPlant, updatePlant, deletePlant, logCareEvent, updateUser, joinCommunity, leaveCommunity,
        createCommunity, addPost, updatePost, deletePost, addComment, searchUserByTelegram, addFriend,
        removeFriend, pendingFriendRequests, handleFriendRequestAction
    } = useMockData();

    const navigate = useNavigate();
    const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());

    // Confetti logic
    const prevLevelRef = useRef(levelInfo.level);
    useEffect(() => {
        if (levelInfo.level > prevLevelRef.current) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 100,
                colors: ['#22C55E', '#3B82F6', '#FACC15', '#EC4899']
            });
            // You could also add a dedicated modal or toast here
            addNotification({
                message: `Новый уровень! Теперь вы ${levelInfo.levelName}`,
                icon: <span className="text-xl">🎉</span>
            });
        }
        prevLevelRef.current = levelInfo.level;
    }, [levelInfo.level]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const newNotification = { ...notification, id: `${Date.now()}-${Math.random()}` };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    // Configuration for care type notifications: text, icon, and specific color
    const careTypeDetails = {
        [CareType.WATER]: { 
            name: CARE_TYPE_RUSSIAN[CareType.WATER], 
            icon: <WaterDropIcon className="w-5 h-5 text-blue-500" /> 
        },
        [CareType.FERTILIZE]: { 
            name: CARE_TYPE_RUSSIAN[CareType.FERTILIZE], 
            icon: <FertilizerIcon className="w-5 h-5 text-purple-500" /> 
        },
        [CareType.REPOT]: { 
            name: CARE_TYPE_RUSSIAN[CareType.REPOT], 
            icon: <SpadeIcon className="w-5 h-5 text-yellow-700" /> 
        },
        [CareType.TRIM]: { 
            name: CARE_TYPE_RUSSIAN[CareType.TRIM], 
            icon: <ScissorsIcon className="w-5 h-5 text-orange-500" /> 
        },
    };

    useEffect(() => {
        const newNotifications: Notification[] = [];
        const newReminderKeys = new Set<string>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        plants.forEach(plant => {
            const careTasks: { type: CareType; dueDate: Date | undefined }[] = [
                {
                    type: CareType.WATER,
                    dueDate: new Date(new Date(plant.lastWateredAt).getTime() + plant.wateringFrequencyDays * 24 * 60 * 60 * 1000)
                },
                { type: CareType.FERTILIZE, dueDate: plant.nextFertilizingDate },
                { type: CareType.REPOT, dueDate: plant.nextRepottingDate },
                { type: CareType.TRIM, dueDate: plant.nextTrimmingDate },
            ];

            careTasks.forEach(({ type, dueDate }) => {
                if (dueDate) {
                    const taskDate = new Date(dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    const timeDiff = taskDate.getTime() - today.getTime();
                    const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    if (daysUntil >= 0 && daysUntil <= 2) {
                        const reminderKey = `${plant.id}-${type}-${taskDate.toISOString().split('T')[0]}`;
                        if (!shownReminders.has(reminderKey)) {
                            const { name, icon } = careTypeDetails[type];
                            const dueText = daysUntil === 0 ? 'Сегодня' : (daysUntil === 1 ? 'Завтра' : `Через ${daysUntil} дня`);
                            newNotifications.push({
                                id: `${reminderKey}-${Date.now()}`,
                                message: `${dueText} пора ${name.toLowerCase()}: ${plant.name}`,
                                icon: icon,
                            });
                            newReminderKeys.add(reminderKey);
                        }
                    }
                }
            });
        });

        if (newNotifications.length > 0) {
            setNotifications(prev => [...prev, ...newNotifications]);
            setShownReminders(prev => new Set([...prev, ...newReminderKeys]));
        }
    }, [plants, shownReminders]);

    useEffect(() => {
        if (pendingNotifications.length > 0) {
            setNotifications(prev => [...prev, ...pendingNotifications]);
            clearPendingNotifications();
        }
    }, [pendingNotifications, clearPendingNotifications]);

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleAddPlant = (newPlantData: Omit<Plant, 'id' | 'createdAt'>) => {
        addPlant(newPlantData);
        setIsAddPlantModalOpen(false);
    };

    const timeAgo = useCallback((date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " г. назад";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " мес. назад";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " д. назад";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " ч. назад";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " мин. назад";
        return "только что";
    }, []);

    return (
        <div className="bg-background text-foreground min-h-screen font-sans">
            <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
                {notifications.map(notification => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => dismissNotification(notification.id)}
                    />
                ))}
            </div>
            <div className="max-w-lg mx-auto pb-20">
                <Header levelInfo={levelInfo} />
                <main>
                    <Routes>
                        <Route path="/" element={
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {plants.map((plant) => (
                                        <PlantCard 
                                            key={plant.id} 
                                            plant={plant} 
                                            onLogCare={(plantId, careType) => logCareEvent(plantId, careType)} 
                                            onSelect={(p) => navigate(`/plants/${p.id}`)} 
                                        />
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setIsAddPlantModalOpen(true)} 
                                    className="fixed bottom-20 right-5 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-transform hover:scale-110 z-20"
                                    aria-label="Добавить растение"
                                >
                                    <PlusIcon className="w-6 h-6" />
                                </button>
                            </div>
                        } />
                        <Route path="/calendar" element={<div className="p-4"><CalendarScreen plants={plants} /></div>} />
                        <Route path="/profile" element={
                            <div className="p-4">
                                <ProfileScreen
                                    user={user}
                                    stats={stats}
                                    levelInfo={levelInfo}
                                    achievements={achievements}
                                    plants={plants}
                                    communities={communities}
                                    onJoinCommunity={joinCommunity}
                                    onLeaveCommunity={leaveCommunity}
                                    onCreateCommunity={createCommunity}
                                    onUpdateUser={updateUser}
                                    searchUserByTelegram={searchUserByTelegram}
                                    addFriend={addFriend}
                                    onSelectCommunity={(c) => navigate(`/communities/${c.id}`)}
                                    onSelectFriend={(fid) => navigate(`/friends/${fid}`)}
                                    pendingFriendRequests={pendingFriendRequests}
                                    onFriendRequestAction={handleFriendRequestAction}
                                />
                            </div>
                        } />
                        <Route path="/plants/:id" element={
                            <PlantDetailRoute 
                                plants={plants} 
                                onUpdatePlant={updatePlant} 
                                onLogCareEvent={logCareEvent} 
                                onDeletePlant={deletePlant} 
                            />
                        } />
                        <Route path="/communities/:id" element={
                            <CommunityDetailRoute 
                                communities={communities}
                                communityPosts={communityPosts}
                                comments={comments}
                                user={user}
                                leaveCommunity={leaveCommunity}
                                joinCommunity={joinCommunity}
                                addPost={addPost}
                                updatePost={updatePost}
                                deletePost={deletePost}
                                addComment={addComment}
                                likedPostIds={likedPostIds}
                                toggleLikePost={toggleLikePost}
                                addNotification={addNotification}
                                timeAgo={timeAgo}
                            />
                        } />
                        <Route path="/friends/:id" element={
                            <FriendProfileRoute 
                                getUserById={getUserById}
                                plants={plants}
                                levelInfo={levelInfo}
                                removeFriend={removeFriend}
                            />
                        } />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
            <Navbar userPhotoUrl={user.photoUrl} />
            <AddPlantModal
                isOpen={isAddPlantModalOpen}
                onClose={() => setIsAddPlantModalOpen(false)}
                onAddPlant={handleAddPlant}
            />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
};

export default App;