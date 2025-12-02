
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
// @ts-ignore
import confetti from 'canvas-confetti';

// Components
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

import { useMockData } from './hooks/useMockData';
import { Plant, Community, CareType, Notification, User } from './types';
import { PlusIcon, WaterDropIcon, FertilizerIcon, SpadeIcon, ScissorsIcon } from './components/icons';
import { CARE_TYPE_RUSSIAN } from './utils';

// --- INLINE LOADER COMPONENT (To fix import issues) ---
const InlineLoader: React.FC = () => {
  const [stage, setStage] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  const texts = [
    "Сажаем семена...",
    "Поливаем...",
    "Ловим лучи солнца...",
    "Распускаем листья...",
    "Добро пожаловать в сад!"
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 1200),
      setTimeout(() => setStage(3), 1800),
    ];
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev < texts.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="relative w-48 h-48 mb-8">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <path d="M20 90 Q50 95 80 90" stroke="#8B4513" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-fade-in" />
          <path d="M45 90 Q50 85 55 90" fill="#5D4037" className="animate-fade-in" />
          {stage >= 1 && (
            <path d="M50 90 C50 80 45 60 50 40" stroke="#22C55E" strokeWidth="4" fill="none" strokeLinecap="round" className="animate-grow-stem origin-bottom" style={{ strokeDasharray: 100 }} />
          )}
          {stage >= 2 && (
            <g className="animate-leaf-out origin-center" style={{ transformBox: 'fill-box' }}>
              <path d="M50 60 Q30 50 40 70" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
              <path d="M50 50 Q70 40 60 60" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
            </g>
          )}
          {stage >= 3 && (
            <g className="animate-bloom origin-center" style={{ transformBox: 'fill-box', transformOrigin: '50px 40px' }}>
              <circle cx="50" cy="40" r="12" fill="#F472B6" />
              <circle cx="50" cy="40" r="6" fill="#FCD34D" />
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <ellipse key={i} cx="50" cy="40" rx="6" ry="14" fill="#EC4899" transform={`rotate(${deg} 50 40) translate(0 -10)`} opacity="0.8" />
              ))}
            </g>
          )}
        </svg>
      </div>
      <p className="text-lg font-medium text-primary animate-pulse transition-all duration-500 min-h-[1.5rem] text-center px-4">
        {texts[textIndex]}
      </p>
    </div>
  );
};

// --- Route Wrappers ---

const PlantDetailRoute = ({ plants, onUpdatePlant, onLogCareEvent, onDeletePlant }: any) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const plant = plants.find((p: Plant) => p.id === id);

    if (!plant) return <Navigate to="/" replace />;

    return (
        <PlantDetailScreen
            plant={plant}
            onBack={() => navigate('/')} 
            onUpdatePlant={onUpdatePlant}
            onLogCareEvent={onLogCareEvent}
            onDeletePlant={(plantId) => {
                onDeletePlant(plantId);
                navigate('/');
            }}
        />
    );
};

const CommunityDetailRoute = ({ 
    communities, communityPosts, comments, user, leaveCommunity, joinCommunity, 
    addPost, updatePost, deletePost, addComment, fetchComments, likedPostIds, toggleLikePost, 
    addNotification, timeAgo, fetchCommunityPosts 
}: any) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const community = communities.find((c: Community) => c.id === id);

    useEffect(() => {
        if (id) {
            fetchCommunityPosts(id);
        }
    }, [id, fetchCommunityPosts]);

    if (!community) return <Navigate to="/profile" replace />;

    return (
        <CommunityDetailScreen
            community={community}
            posts={communityPosts.filter((p: any) => p.communityId === community.id)}
            comments={comments}
            currentUser={user}
            onBack={() => navigate('/profile')} 
            onLeaveCommunity={(cid) => {
                 leaveCommunity(cid);
                 navigate('/profile'); 
            }}
            onJoinCommunity={joinCommunity}
            onAddPost={addPost}
            onUpdatePost={updatePost}
            onDeletePost={deletePost}
            onAddComment={addComment}
            onFetchComments={fetchComments}
            likedPostIds={likedPostIds}
            toggleLikePost={toggleLikePost}
            addNotification={addNotification}
            timeAgo={timeAgo}
        />
    );
};

const FriendProfileRoute = ({ getUserById, getFriendPlants, levelInfo, removeFriend }: any) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const friend = getUserById(id);
    const [friendPlants, setFriendPlants] = useState<Plant[]>([]);
    
    useEffect(() => {
        if (friend && friend.id) {
            getFriendPlants(friend.id).then((plants: Plant[]) => setFriendPlants(plants));
        }
    }, [friend, getFriendPlants]);

    if (!friend) return <Navigate to="/profile" replace />;

    return (
        <FriendProfileScreen
            friend={friend}
            plants={friendPlants}
            levelInfo={levelInfo}
            onBack={() => navigate('/profile')}
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
        isLoading,
        error, // Get error state
        retryFetch, // Get retry function
        plants, user, stats, levelInfo, achievements, communities, communityPosts, comments, careEvents,
        likedPostIds, toggleLikePost, getUserById, pendingNotifications, clearPendingNotifications,
        addPlant, updatePlant, deletePlant, logCareEvent, updateUser, joinCommunity, leaveCommunity,
        createCommunity, addPost, updatePost, deletePost, addComment, fetchComments, searchUserByTelegram, addFriend,
        removeFriend, pendingFriendRequests, handleFriendRequestAction, fetchCommunityPosts, getFriendPlants
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

    const handleAddPlant = (newPlantData: any) => {
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

    // --- Loading State ---
    if (isLoading) {
        return <InlineLoader />;
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
                <div className="text-6xl mb-4">🥀</div>
                <h1 className="text-xl font-bold mb-2">Упс, что-то пошло не так</h1>
                <p className="text-foreground/70 mb-6">{error}</p>
                <button 
                    onClick={() => retryFetch ? retryFetch() : window.location.reload()}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:bg-primary/90 transition-transform active:scale-95"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground min-h-screen font-sans">
            <div className="fixed top-4 right-4 z-[60] w-full max-w-sm space-y-2">
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
                                fetchComments={fetchComments}
                                likedPostIds={likedPostIds}
                                toggleLikePost={toggleLikePost}
                                addNotification={addNotification}
                                timeAgo={timeAgo}
                                fetchCommunityPosts={fetchCommunityPosts}
                            />
                        } />
                        <Route path="/friends/:id" element={
                            <FriendProfileRoute 
                                getUserById={getUserById}
                                getFriendPlants={getFriendPlants}
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
