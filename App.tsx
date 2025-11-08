import React, { useState, useCallback, useEffect } from 'react';
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

const App: React.FC = () => {
    const {
        plants, user, stats, levelInfo, achievements, communities, communityPosts, comments, careEvents,
        likedPostIds, toggleLikePost, getUserById, pendingNotifications, clearPendingNotifications,
        addPlant, updatePlant, deletePlant, logCareEvent, updateUser, joinCommunity, leaveCommunity,
        createCommunity, addPost, updatePost, deletePost, addComment, searchUserByTelegram, addFriend,
        removeFriend
    } = useMockData();

    const [activeScreen, setActiveScreen] = useState('Сад');
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
    const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
    const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const newNotification = { ...notification, id: `${Date.now()}-${Math.random()}` };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const careTypeDetails = {
        [CareType.WATER]: { name: CARE_TYPE_RUSSIAN[CareType.WATER], Icon: <WaterDropIcon className="w-5 h-5 text-blue-400" /> },
        [CareType.FERTILIZE]: { name: CARE_TYPE_RUSSIAN[CareType.FERTILIZE], Icon: <FertilizerIcon className="w-5 h-5 text-purple-400" /> },
        [CareType.REPOT]: { name: CARE_TYPE_RUSSIAN[CareType.REPOT], Icon: <SpadeIcon className="w-5 h-5 text-yellow-600" /> },
        [CareType.TRIM]: { name: CARE_TYPE_RUSSIAN[CareType.TRIM], Icon: <ScissorsIcon className="w-5 h-5 text-orange-400" /> },
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
                            const { name, Icon } = careTypeDetails[type];
                            const dueText = daysUntil === 0 ? 'Сегодня' : (daysUntil === 1 ? 'Завтра' : `Через ${daysUntil} дня`);
                            newNotifications.push({
                                id: `${reminderKey}-${Date.now()}`,
                                message: `${dueText} пора ${name.toLowerCase()}: ${plant.name}`,
                                icon: Icon,
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

    useEffect(() => {
        if (selectedCommunity) {
            const updatedCommunity = communities.find(c => c.id === selectedCommunity.id);
            if (updatedCommunity) {
                setSelectedCommunity(updatedCommunity);
            } else {
                setSelectedCommunity(null);
            }
        }
    }, [communities, selectedCommunity]);

    const handleSelectPlant = (plant: Plant) => {
        setSelectedPlant(plant);
    };

    const handleSelectCommunity = (community: Community) => {
        setSelectedCommunity(community);
    };

    const handleSelectFriend = (friendId: string) => {
        const friendUser = getUserById(friendId);
        if(friendUser) {
            setSelectedFriend(friendUser);
        }
    };
    
    const handleBackFromDetail = () => {
        setSelectedPlant(null);
        setSelectedCommunity(null);
        setSelectedFriend(null);
    };

    const handleAddPlant = (newPlantData: Omit<Plant, 'id' | 'createdAt'>) => {
        addPlant(newPlantData);
        setIsAddPlantModalOpen(false);
    };
    
    const handleDeletePlant = (plantId: string) => {
        deletePlant(plantId);
        setSelectedPlant(null);
    }

    const handleRemoveFriend = (friendId: string) => {
        removeFriend(friendId);
        setSelectedFriend(null);
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

    const handleNavigate = (screen: string) => {
        setSelectedPlant(null);
        setSelectedCommunity(null);
        setSelectedFriend(null);
        setActiveScreen(screen);
    };

    const renderContent = () => {
        if (selectedFriend) {
            return (
                <FriendProfileScreen
                    friend={selectedFriend}
                    plants={plants.filter(p => p.userId === selectedFriend.id)}
                    levelInfo={levelInfo} // Note: In a real app, this would be the friend's level info
                    onBack={handleBackFromDetail}
                    onRemoveFriend={handleRemoveFriend}
                />
            )
        }
        if (selectedPlant) {
            return (
                <PlantDetailScreen
                    plant={selectedPlant}
                    onBack={handleBackFromDetail}
                    onUpdatePlant={updatePlant}
                    onLogCareEvent={logCareEvent}
                    onDeletePlant={handleDeletePlant}
                />
            );
        }

        if (selectedCommunity) {
            return (
                <CommunityDetailScreen
                    community={selectedCommunity}
                    posts={communityPosts.filter(p => p.communityId === selectedCommunity.id)}
                    comments={comments}
                    currentUser={user}
                    onBack={handleBackFromDetail}
                    onLeaveCommunity={leaveCommunity}
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
            )
        }

        switch (activeScreen) {
            case 'Календарь':
                return <div className="p-4"><CalendarScreen plants={plants} /></div>;
            case 'Профиль':
                return <div className="p-4">
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
                            onSelectCommunity={handleSelectCommunity}
                            onSelectFriend={handleSelectFriend}
                        />
                       </div>;
            case 'Сад':
            default:
                return (
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            {plants.map((plant) => (
                                <PlantCard key={plant.id} plant={plant} onLogCare={(plantId, careType) => logCareEvent(plantId, careType)} onSelect={handleSelectPlant} />
                            ))}
                        </div>
                        <button 
                            onClick={() => setIsAddPlantModalOpen(true)} 
                            className="fixed bottom-20 right-5 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
                            aria-label="Добавить растение"
                        >
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    </div>
                );
        }
    };

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
                    {renderContent()}
                </main>
            </div>
            <Navbar activeScreen={activeScreen} setActiveScreen={handleNavigate} userPhotoUrl={user.photoUrl} />
            <AddPlantModal
                isOpen={isAddPlantModalOpen}
                onClose={() => setIsAddPlantModalOpen(false)}
                onAddPlant={handleAddPlant}
            />
        </div>
    );
};

export default App;