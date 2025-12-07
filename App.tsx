
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
// @ts-ignore
import confetti from 'canvas-confetti';
import { differenceInCalendarDays } from 'date-fns';

// Components
import Header from './components/Header';
import Navbar from './components/Navbar';
import PlantCard from './components/PlantCard';
import CalendarScreen from './components/CalendarScreen';
import ProfileScreen from './components/ProfileScreen';
import MarketScreen from './components/MarketScreen';
import PlantDetailScreen from './components/PlantDetailScreen';
import AddPlantModal from './components/AddPlantModal';
import NotificationToast from './components/NotificationToast';
import FriendProfileScreen from './components/FriendProfileScreen';
import AppLoader from './components/AppLoader';

import { useMockData } from './hooks/useMockData';
import { Plant, CareType, Notification, User } from './types';
import { PlusIcon, WaterDropIcon, FertilizerIcon, SpadeIcon, ScissorsIcon } from './components/icons';
import { CARE_TYPE_RUSSIAN, triggerHaptic } from './utils';
import { api } from './services/api';

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

const FriendProfileRoute = ({ getUser, getFriendPlants, removeFriend }: any) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [friend, setFriend] = useState<User | null>(null);
    const [friendPlants, setFriendPlants] = useState<Plant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (id) {
            setIsLoading(true);
            Promise.all([
                getUser(id),
                getFriendPlants(id)
            ]).then(([userData, plantsData]) => {
                setFriend(userData);
                setFriendPlants(plantsData);
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        }
    }, [id, getUser, getFriendPlants]);

    if (isLoading) return <div className="p-10 text-center">Загрузка профиля...</div>;
    if (!friend) return <Navigate to="/profile" replace />;

    return (
        <FriendProfileScreen
            friend={friend}
            plants={friendPlants}
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
        error, 
        retryFetch, 
        plants, marketItems, user, levelInfo, achievements,
        getUser, pendingNotifications, clearPendingNotifications,
        addPlant, updatePlant, deletePlant, logCareEvent, updateUser, deleteAccount,
        searchUserByTelegram, addFriend,
        removeFriend, pendingFriendRequests, handleFriendRequestAction, getFriendPlants
    } = useMockData();

    const navigate = useNavigate();
    const location = useLocation();
    const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // Pull-to-Refresh State
    const [pullStartY, setPullStartY] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const MIN_PULL_DISTANCE = 100;
    
    const [shownReminders, setShownReminders] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('botgardener_shown_reminders');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('botgardener_shown_reminders', JSON.stringify(Array.from(shownReminders)));
        } catch (e) {
            console.error("Failed to save reminders", e);
        }
    }, [shownReminders]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const newNotification = { ...notification, id: `${Date.now()}-${Math.random()}` };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    // --- WEATHER CHECK ---
    useEffect(() => {
        if (plants.length > 0 && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const res = await api.checkWeather(position.coords.latitude, position.coords.longitude);
                    if (res.alert) {
                        addNotification({
                            message: res.alert,
                            icon: <span className="text-xl">🌦</span>
                        });
                    }
                } catch (e) {
                    console.error("Weather check failed", e);
                }
            }, (err) => {
                console.log("Geolocation denied or error", err);
            });
        }
    }, [plants.length, addNotification]); 

    useEffect(() => {
        // @ts-ignore
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            
            if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
                if (location.pathname !== '/' && location.pathname !== '/profile' && location.pathname !== '/calendar' && location.pathname !== '/market') {
                    tg.BackButton.show();
                } else {
                    tg.BackButton.hide();
                }

                const handleBack = () => {
                    navigate(-1);
                };

                tg.BackButton.onClick(handleBack);

                return () => {
                    tg.BackButton.offClick(handleBack);
                };
            }
        }
    }, [location, navigate]);

    const prevLevelRef = useRef(levelInfo.level);
    useEffect(() => {
        if (levelInfo.level > prevLevelRef.current && prevLevelRef.current !== 1) { 
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 100,
                colors: ['#22C55E', '#3B82F6', '#FACC15', '#EC4899']
            });
        }
        prevLevelRef.current = levelInfo.level;
    }, [levelInfo.level]);

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
                    dueDate: plant.wateringFrequencyDays > 0 
                        ? new Date(new Date(plant.lastWateredAt).getTime() + plant.wateringFrequencyDays * 24 * 60 * 60 * 1000)
                        : undefined
                },
                { type: CareType.FERTILIZE, dueDate: plant.nextFertilizingDate },
                { type: CareType.REPOT, dueDate: plant.nextRepottingDate },
                { type: CareType.TRIM, dueDate: plant.nextTrimmingDate },
            ];

            careTasks.forEach(({ type, dueDate }) => {
                if (dueDate) {
                    const taskDate = new Date(dueDate);
                    const daysUntil = differenceInCalendarDays(taskDate, today);

                    if (daysUntil <= 2) {
                        const reminderKey = `${plant.id}-${type}-${taskDate.toISOString().split('T')[0]}`;
                        
                        if (!shownReminders.has(reminderKey) && !newReminderKeys.has(reminderKey)) {
                            const { name, icon } = careTypeDetails[type];
                            let dueText = '';
                            if (daysUntil < 0) dueText = 'Просрочено!';
                            else if (daysUntil === 0) dueText = 'Сегодня';
                            else if (daysUntil === 1) dueText = 'Завтра';
                            else dueText = `Через ${daysUntil} дня`;

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
            setShownReminders(prev => {
                const updated = new Set(prev);
                newReminderKeys.forEach(k => updated.add(k));
                return updated;
            });
        }
    }, [plants]); 

    useEffect(() => {
        if (pendingNotifications.length > 0) {
            setNotifications(prev => [...prev, ...pendingNotifications]);
            clearPendingNotifications();
        }
    }, [pendingNotifications, clearPendingNotifications]);

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleLogCare = (plantId: string, careType: CareType) => {
        logCareEvent(plantId, careType);
        setNotifications(prev => prev.filter(n => {
            return !n.id.startsWith(`${plantId}-${careType}`);
        }));
    };

    const handleAddPlant = (newPlantData: any) => {
        addPlant(newPlantData);
        setIsAddPlantModalOpen(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setPullStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (pullStartY > 0 && window.scrollY === 0 && !isRefreshing) {
            const currentY = e.touches[0].clientY;
            const diff = currentY - pullStartY;
            if (diff > 0) {
                setPullDistance(Math.min(diff * 0.5, 150)); 
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > MIN_PULL_DISTANCE && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(MIN_PULL_DISTANCE); 
            triggerHaptic('medium');
            if (retryFetch) {
                await retryFetch();
            }
            setTimeout(() => {
                setIsRefreshing(false);
                setPullDistance(0);
                setPullStartY(0);
            }, 500);
        } else {
            setPullDistance(0);
            setPullStartY(0);
        }
    };

    if (isLoading) {
        return <AppLoader />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center animate-fade-in">
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
        <div 
            className="bg-background text-foreground min-h-screen font-sans touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div 
                className="fixed top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 transition-all duration-200 ease-out overflow-hidden"
                style={{ height: `${pullDistance}px`, opacity: pullDistance > 0 ? 1 : 0 }}
            >
                <div className="flex items-center gap-2 text-primary font-bold bg-card/80 backdrop-blur rounded-full px-4 py-2 shadow-lg mt-4">
                    {isRefreshing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span>Обновление...</span>
                        </>
                    ) : (
                        <span>{pullDistance > MIN_PULL_DISTANCE ? 'Отпустите для обновления' : 'Тяните вниз...'}</span>
                    )}
                </div>
            </div>

            <div className="fixed top-4 right-4 z-[60] w-full max-w-sm space-y-2 pointer-events-none">
                {notifications.map(notification => (
                    <div key={notification.id} className="pointer-events-auto">
                        <NotificationToast
                            notification={notification}
                            onDismiss={() => dismissNotification(notification.id)}
                        />
                    </div>
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
                                            onLogCare={handleLogCare} 
                                            onSelect={(p) => navigate(`/plants/${p.id}`)} 
                                        />
                                    ))}
                                </div>
                                {plants.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                        <div className="text-4xl mb-2">🌱</div>
                                        <p>Ваш сад пока пуст.</p>
                                        <p className="text-sm">Нажмите "+" чтобы добавить первое растение!</p>
                                    </div>
                                )}
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
                        <Route path="/market" element={<MarketScreen items={marketItems} onAddItem={handleAddPlant} user={user} />} />
                        <Route path="/profile" element={
                            <div className="p-4">
                                <ProfileScreen
                                    user={user}
                                    levelInfo={levelInfo}
                                    achievements={achievements}
                                    plants={plants}
                                    onUpdateUser={updateUser}
                                    deleteAccount={deleteAccount}
                                    searchUserByTelegram={searchUserByTelegram}
                                    addFriend={addFriend}
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
                                onLogCareEvent={handleLogCare} 
                                onDeletePlant={deletePlant} 
                            />
                        } />
                        <Route path="/friends/:id" element={
                            <FriendProfileRoute 
                                getUser={getUser}
                                getFriendPlants={getFriendPlants}
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
