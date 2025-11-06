import React, { useState, useEffect, useRef, UIEvent } from 'react';
import { Stats, LevelInfo, Achievement, Plant, User, Community } from '../types';
import CommunitiesScreen from './CommunitiesScreen';
import StatsScreen from './StatsScreen';
import AchievementsScreen from './AchievementsScreen';
import { 
    AchievementIcon, StatsIcon, CakeIcon, UsersIcon, 
    ProfileIcon as GenderIcon, GardenForkIcon, CloseIcon, SaveIcon, UploadIcon, AtSymbolIcon,
    SearchIcon, MessageCircleIcon, UserPlusIcon
} from './icons';

interface ProfileScreenProps {
    user: User;
    stats: Stats;
    levelInfo: LevelInfo;
    achievements: (Achievement & { earnedAt?: Date })[];
    plants: Plant[];
    communities: Community[];
    onJoinCommunity: (communityId: string) => void;
    onLeaveCommunity: (communityId: string) => void;
    onUpdateUser: (updatedData: User) => void;
    searchUserByTelegram: (username: string) => User | null;
    addFriend: (user: User) => void;
}

type ProfileTab = 'stats' | 'achievements' | 'communities';

const TABS: ProfileTab[] = ['stats', 'achievements', 'communities'];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, stats, levelInfo, achievements, plants, communities, onJoinCommunity, onLeaveCommunity, onUpdateUser, searchUserByTelegram, addFriend }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('stats');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editableUser, setEditableUser] = useState(user);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<User | 'not_found' | null>(null);
    const [showSearchResultActions, setShowSearchResultActions] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollEndTimer = useRef<number | null>(null);

    useEffect(() => {
        setEditableUser(user);
    }, [user]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const tabIndex = TABS.indexOf(activeTab);
            const container = scrollContainerRef.current;
            const targetScrollLeft = container.offsetWidth * tabIndex;

            if (Math.abs(container.scrollLeft - targetScrollLeft) > 1) {
                container.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth',
                });
            }
        }
    }, [activeTab]);

    const handleOpenModal = () => {
        setEditableUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveChanges = () => {
        onUpdateUser(editableUser);
        setIsEditModalOpen(false);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newPhotoUrl = URL.createObjectURL(file);
            setEditableUser(prev => ({ ...prev, photoUrl: newPhotoUrl }));
        }
    };
    
    const genderMap = {
        male: 'Мужской',
        female: 'Женский',
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setShowSearchResultActions(null);
        if (!query.trim()) {
            setSearchResult(null);
            return;
        }
        const result = searchUserByTelegram(query);
        setSearchResult(result ? result : 'not_found');
    };

    const handleAddFriend = (userToAdd: User) => {
        addFriend(userToAdd);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResult(null);
        setShowSearchResultActions(null);
    };

    const isAlreadyFriend = (userId: string) => user.friends.some(f => f.id === userId);
    
    const handleTabClick = (tab: ProfileTab) => {
        setActiveTab(tab);
    };

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        // FIX: Added a check to ensure scrollEndTimer.current is valid before calling clearTimeout.
        if (scrollEndTimer.current) {
            clearTimeout(scrollEndTimer.current);
        }
        scrollEndTimer.current = window.setTimeout(() => {
            const container = e.currentTarget;
            const pageIndex = Math.round(container.scrollLeft / container.offsetWidth);
            const newTab = TABS[pageIndex];
            if (newTab && newTab !== activeTab) {
                setActiveTab(newTab);
            }
        }, 100);
    };


    const renderTabs = () => (
        <div className="flex bg-card border border-accent rounded-full p-1 mb-6">
            <button onClick={() => handleTabClick('stats')} className={`flex-1 flex items-center gap-2 px-2 py-2 text-sm font-semibold rounded-full justify-center transition-colors duration-300 ${activeTab === 'stats' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}> <StatsIcon className="w-4 h-4" /> Статистика</button>
            <button onClick={() => handleTabClick('achievements')} className={`flex-1 flex items-center gap-2 px-2 py-2 text-sm font-semibold rounded-full justify-center transition-colors duration-300 ${activeTab === 'achievements' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}> <AchievementIcon className="w-4 h-4" /> Достижения</button>
            <button onClick={() => handleTabClick('communities')} className={`flex-1 flex items-center gap-2 px-2 py-2 text-sm font-semibold rounded-full justify-center transition-colors duration-300 ${activeTab === 'communities' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}> <UsersIcon className="w-4 h-4" /> Сообщества</button>
        </div>
    );
    
    return (
        <div className="animate-fade-in">
            <div className="relative">
                <div className="flex flex-col items-center mb-6">
                    <img src={user.photoUrl} alt="Аватар пользователя" className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-primary/50" />
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-sm text-foreground/70">{levelInfo.levelName} - Уровень {levelInfo.level}</p>
                </div>
                 <button onClick={handleOpenModal} className="absolute top-0 right-0 p-2 rounded-full hover:bg-accent">
                    <GardenForkIcon className="w-6 h-6" />
                 </button>
            </div>
            
            <div className="bg-card border border-accent rounded-lg p-4 mb-6 space-y-4">
                <div className="space-y-2 text-sm text-foreground/80">
                     <div className="flex items-center gap-2">
                        <GenderIcon className="w-4 h-4" />
                        <span>Пол: {genderMap[user.gender]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CakeIcon className="w-4 h-4" />
                        <span>Возраст: {user.age}</span>
                    </div>
                    {user.telegramUsername && (
                        <div className="flex items-center gap-2">
                            <AtSymbolIcon className="w-4 h-4" />
                            <span>{user.telegramUsername}</span>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold mb-1">Обо мне</h3>
                    <p className="text-sm text-foreground/80">{user.about}</p>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                     <h3 className="font-bold text-lg flex items-center gap-2">
                        <UsersIcon className="w-5 h-5"/>
                        Друзья
                     </h3>
                     <button onClick={() => setIsSearching(!isSearching)} className="p-1 rounded-full hover:bg-accent">
                        {isSearching ? <CloseIcon className="w-5 h-5"/> : <SearchIcon className="w-5 h-5"/>}
                     </button>
                </div>

                {isSearching && (
                    <div className="mb-4 animate-fade-in">
                        <input
                            type="text"
                            placeholder="Поиск по имени Telegram..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                    </div>
                )}
                
                {searchResult && (
                    <div className="mb-4 animate-fade-in">
                        {searchResult === 'not_found' ? (
                            <p className="text-center text-foreground/70 p-3 bg-card border border-accent rounded-lg">Такого пользователя нет</p>
                        ) : (
                            <div className="relative bg-card border border-accent rounded-lg p-3 flex items-center gap-3">
                                <img src={searchResult.photoUrl} alt={searchResult.name} className="w-12 h-12 rounded-full object-cover cursor-pointer" onClick={() => setShowSearchResultActions(searchResult.id)} />
                                <div>
                                    <p className="font-bold">{searchResult.name}</p>
                                    <p className="text-sm text-foreground/70">{searchResult.telegramUsername}</p>
                                </div>
        
                                {showSearchResultActions === searchResult.id && (
                                    <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center gap-3 animate-fade-in">
                                        <button title="Написать сообщение" className="p-3 bg-accent rounded-full hover:bg-primary/50"><MessageCircleIcon className="w-5 h-5"/></button>
                                        {!isAlreadyFriend(searchResult.id) ? (
                                             <button title="Добавить в друзья" onClick={() => handleAddFriend(searchResult)} className="p-3 bg-accent rounded-full hover:bg-primary/50"><UserPlusIcon className="w-5 h-5"/></button>
                                        ) : <p className="text-xs font-bold text-primary-foreground">Уже в друзьях</p>}
                                        <button title="Отмена" onClick={() => setShowSearchResultActions(null)} className="p-2 bg-accent rounded-full hover:bg-red-500/50"><CloseIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div 
                    className="flex gap-3 overflow-x-auto pb-2 -mb-2 no-scrollbar overscroll-x-contain"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {user.friends.map(friend => (
                        <div key={friend.id} className="flex flex-col items-center flex-shrink-0 w-20 text-center">
                            <img src={friend.photoUrl} alt={friend.name} className="w-16 h-16 rounded-full object-cover mb-1 border-2 border-accent" />
                            <span className="text-xs truncate w-full">{friend.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {renderTabs()}
            
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
                <div className="w-full flex-shrink-0 snap-start">
                    <StatsScreen stats={stats} plants={plants} />
                </div>
                <div className="w-full flex-shrink-0 snap-start">
                    <AchievementsScreen achievements={achievements} />
                </div>
                <div className="w-full flex-shrink-0 snap-start">
                    <CommunitiesScreen communities={communities} onJoin={onJoinCommunity} onLeave={onLeaveCommunity} />
                </div>
            </div>


            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-card rounded-2xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Редактировать профиль</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-accent -mr-2 -mt-2">
                                <CloseIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
                                    <img src={editableUser.photoUrl} alt="Аватар" className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-primary/50" />
                                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-card/80 text-card-foreground p-2 rounded-full shadow-lg hover:bg-card">
                                        <UploadIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">Имя</label>
                                <input type="text" value={editableUser.name} onChange={(e) => setEditableUser({...editableUser, name: e.target.value})} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">Telegram</label>
                                <input type="text" value={editableUser.telegramUsername || ''} onChange={(e) => setEditableUser({...editableUser, telegramUsername: e.target.value})} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-foreground/80 mb-1">Пол</label>
                                    <select value={editableUser.gender} onChange={(e) => setEditableUser({...editableUser, gender: e.target.value as 'male' | 'female'})} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary">
                                        <option value="female">Женский</option>
                                        <option value="male">Мужской</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-foreground/80 mb-1">Возраст</label>
                                    <input type="number" value={editableUser.age} onChange={(e) => setEditableUser({...editableUser, age: parseInt(e.target.value, 10) || 0})} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">Обо мне</label>
                                <textarea value={editableUser.about} onChange={(e) => setEditableUser({...editableUser, about: e.target.value})} rows={3} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary no-scrollbar"/>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors">Отмена</button>
                            <button onClick={handleSaveChanges} className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                                <SaveIcon className="w-4 h-4"/> Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;
