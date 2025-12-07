
import React, { useState, useEffect, useRef } from 'react';
import { LevelInfo, Achievement, Plant, User, DailyQuest } from '../types';
import AchievementsScreen from './AchievementsScreen';
import DailyQuestsWidget from './DailyQuestsWidget';
import { 
    CakeIcon, 
    ProfileIcon as GenderIcon, GardenForkIcon, CloseIcon, SaveIcon, UploadIcon, AtSymbolIcon,
    SearchIcon,
    CheckIcon,
    TrashIcon,
} from './icons';
import { compressImage } from '../utils';

interface ProfileScreenProps {
    user: User;
    levelInfo: LevelInfo;
    achievements: (Achievement & { earnedAt?: Date })[];
    plants: Plant[];
    onUpdateUser: (updatedData: any) => void;
    searchUserByTelegram: (username: string) => Promise<User | null> | User | null;
    addFriend: (user: User) => void;
    onSelectFriend: (friendId: string) => void;
    pendingFriendRequests: User[];
    onFriendRequestAction: (requestingUser: User, accept: boolean) => void;
    deleteAccount: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
    user, levelInfo, achievements,
    onUpdateUser, 
    searchUserByTelegram, addFriend, onSelectFriend,
    pendingFriendRequests, onFriendRequestAction, deleteAccount
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editableUser, setEditableUser] = useState(user);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<User | 'not_found' | null>(null);
    const [showSearchResultActions, setShowSearchResultActions] = useState<string | null>(null);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    
    const [quests, setQuests] = useState<DailyQuest[]>(user.dailyQuests || []);

    useEffect(() => {
        if(user.dailyQuests) setQuests(user.dailyQuests);
    }, [user.dailyQuests]);

    const handleQuestComplete = (questId: string) => {
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, isCompleted: true } : q));
    };

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

    useEffect(() => {
        setEditableUser(user);
    }, [user]);

    useEffect(() => {
        return () => {
            if (editableUser.photoUrl && editableUser.photoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(editableUser.photoUrl);
            }
        };
    }, [editableUser.photoUrl]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsLoadingSearch(true);
                setShowSearchResultActions(null);
                try {
                    const result = await searchUserByTelegram(searchQuery);
                    setSearchResult(result ? result : 'not_found');
                } catch (e) {
                    setSearchResult('not_found');
                } finally {
                    setIsLoadingSearch(false);
                }
            } else {
                setSearchResult(null);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [searchQuery, searchUserByTelegram]);

    const handleOpenModal = () => {
        setEditableUser(user);
        setPhotoFile(null);
        setIsEditModalOpen(true);
    };

    const handleSaveChanges = () => {
        if (isCompressing) return;
        setIsSaving(true);
        
        const formData = new FormData();
        formData.append('name', editableUser.name);
        formData.append('about', editableUser.about);
        formData.append('gender', editableUser.gender);
        formData.append('age', editableUser.age.toString());
        if (editableUser.telegramUsername) {
            formData.append('telegramUsername', editableUser.telegramUsername);
        }
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        onUpdateUser(formData);
        setIsEditModalOpen(false);
        setIsSaving(false);
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const originalFile = e.target.files[0];
            setIsCompressing(true);
            try {
                const compressedFile = await compressImage(originalFile);
                setPhotoFile(compressedFile);
                
                if (editableUser.photoUrl && editableUser.photoUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(editableUser.photoUrl);
                }

                const newPhotoUrl = URL.createObjectURL(compressedFile);
                setEditableUser(prev => ({ ...prev, photoUrl: newPhotoUrl }));
            } catch (err) {
                console.error("Compression failed", err);
                setPhotoFile(originalFile);
                setEditableUser(prev => ({ ...prev, photoUrl: URL.createObjectURL(originalFile) }));
            } finally {
                setIsCompressing(false);
            }
        }
    };
    
    const genderMap = {
        male: 'Мужской',
        female: 'Женский',
    };

    const handleSearchInput = (query: string) => {
        setSearchQuery(query);
    };

    const handleAddFriend = (userToAdd: User) => {
        addFriend(userToAdd);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResult(null);
        setShowSearchResultActions(null);
    };

    const handleDeleteAccount = () => {
        deleteAccount();
    };

    const isAlreadyFriend = (userId: string) => user.friends.some(f => f.id === userId);
    
    // AI Requests Display (Hard limit 5)
    const requestsUsed = user.aiRequestsCount || 0;
    const requestsLimit = 5;
    const isLimitReached = requestsUsed >= requestsLimit;
    const percentUsed = Math.min(100, (requestsUsed / requestsLimit) * 100);
    
    return (
        <div className="animate-fade-in">
            <div className="relative">
                <div className="flex flex-col items-center mb-6">
                    <img src={user.photoUrl || 'https://placehold.co/150'} alt="Аватар пользователя" className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-primary/50" />
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {user.name}
                    </h1>
                    <p className="text-sm text-foreground/70">{levelInfo.levelName} - Уровень {levelInfo.level}</p>
                </div>
                 <button onClick={handleOpenModal} className="absolute top-0 right-0 p-2 rounded-full hover:bg-accent">
                    <GardenForkIcon className="w-6 h-6" />
                 </button>
            </div>
            
            {/* Usage Stats Block */}
            <div className={`rounded-xl p-4 mb-6 border bg-card border-accent`}>
                <h3 className="font-bold text-lg mb-2">AI Ассистент</h3>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground/70">Использовано за месяц</span>
                    <span className={isLimitReached ? "text-red-500 font-bold" : "text-primary font-bold"}>
                        {requestsUsed} / {requestsLimit}
                    </span>
                </div>
                <div className="w-full bg-accent rounded-full h-2.5 mb-2">
                    <div 
                        className={`h-2.5 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${percentUsed}%` }}
                    ></div>
                </div>
                <p className="text-xs text-foreground/50 text-center">
                    {isLimitReached ? "Лимит исчерпан. Обновление 1-го числа." : "Доступно для диагностики и чата с растениями."}
                </p>
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

            <DailyQuestsWidget quests={quests} onQuestCompleted={handleQuestComplete} />

            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                     <h3 className="font-bold text-lg">
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
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                        {isLoadingSearch && <p className="text-xs text-center mt-2 text-foreground/50">Поиск...</p>}
                    </div>
                )}
                
                {searchResult && !isLoadingSearch && (
                    <div className="mb-4 animate-fade-in">
                        {searchResult === 'not_found' ? (
                            <p className="text-center text-foreground/70 p-3 bg-card border border-accent rounded-lg">Такого пользователя нет</p>
                        ) : (
                            <div className="relative bg-card border border-accent rounded-lg p-3 flex items-center gap-3 cursor-pointer" onClick={() => setShowSearchResultActions(searchResult.id)}>
                                <img src={searchResult.photoUrl || 'https://placehold.co/150'} alt={searchResult.name} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="font-bold">{searchResult.name}</p>
                                    <p className="text-sm text-foreground/70">{searchResult.telegramUsername}</p>
                                </div>
        
                                {showSearchResultActions === searchResult.id && (
                                    <div 
                                        className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center gap-4 animate-fade-in"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <a
                                          href={`https://t.me/${searchResult.telegramUsername}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Написать сообщение"
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-2xl"
                                        >
                                          💬
                                        </a>

                                        {!isAlreadyFriend(searchResult.id) ? (
                                             <button 
                                                title="Добавить в друзья" 
                                                onClick={(e) => { e.stopPropagation(); handleAddFriend(searchResult); }} 
                                                className="w-12 h-12 flex items-center justify-center bg-accent rounded-full hover:bg-accent/80 transition-colors text-purple-400 font-bold text-3xl"
                                             >
                                                +
                                             </button>
                                        ) : <p className="text-xs font-bold text-primary-foreground">Уже в друзьях</p>}
                                        <button 
                                            title="Отмена" 
                                            onClick={(e) => { e.stopPropagation(); setShowSearchResultActions(null); }} 
                                            className="w-12 h-12 flex items-center justify-center bg-accent rounded-full hover:bg-accent/80 transition-colors text-red-500 font-bold text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {pendingFriendRequests.length > 0 && (
                    <div className="mb-4 space-y-3 animate-fade-in">
                        {pendingFriendRequests.map(request => (
                            <div key={request.id} className="bg-card border border-primary/30 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <img src={request.photoUrl || 'https://placehold.co/150'} alt={request.name} className="w-12 h-12 rounded-full object-cover" />
                                    <p className="flex-grow text-sm">
                                        <span className="font-bold">{request.name}</span> хочет добавить вас в друзья.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2 mt-3">
                                    <button 
                                        onClick={() => onFriendRequestAction(request, false)}
                                        className="px-4 py-1.5 bg-accent text-sm font-semibold rounded-full hover:bg-accent/70"
                                    >
                                        Отклонить
                                    </button>
                                    <button 
                                        onClick={() => onFriendRequestAction(request, true)}
                                        className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 flex items-center gap-1.5"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        Принять
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                <div 
                    className="flex gap-3 overflow-x-auto pb-2 -mb-2 no-scrollbar overscroll-x-contain"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {user.friends.map(friend => (
                        <button 
                            key={friend.id} 
                            onClick={() => onSelectFriend(friend.id)}
                            className="flex flex-col items-center flex-shrink-0 w-20 text-center group"
                        >
                            <img src={friend.photoUrl || 'https://placehold.co/150'} alt={friend.name} className="w-16 h-16 rounded-full object-cover mb-1 border-2 border-accent group-hover:border-primary transition-colors" />
                            <span className="text-xs truncate w-full group-hover:text-primary transition-colors">{friend.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <AchievementsScreen achievements={achievements} />

            <div className="mt-10 pt-6 border-t border-accent">
                <button
                    onClick={() => setIsDeleteAccountOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-semibold"
                >
                    <TrashIcon className="w-5 h-5" />
                    Удалить аккаунт
                </button>
                <p className="text-xs text-center text-foreground/40 mt-2">
                    Внимание: это действие удалит все ваши данные, растения и историю навсегда.
                </p>
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
                                    <img src={editableUser.photoUrl || 'https://placehold.co/150'} alt="Аватар" className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-primary/50" />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        disabled={isCompressing}
                                        className="absolute bottom-1 right-1 bg-card/80 text-card-foreground p-2 rounded-full shadow-lg hover:bg-card disabled:opacity-50"
                                    >
                                        {isCompressing ? <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin"/> : <UploadIcon className="w-4 h-4" />}
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
                                    <label htmlFor="user-age" className="block text-sm font-medium text-foreground/80 mb-1">Возраст</label>
                                    <input
                                        id="user-age"
                                        type="number"
                                        value={editableUser.age}
                                        onChange={(e) => setEditableUser({ ...editableUser, age: parseInt(e.target.value, 10) || 0 })}
                                        className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                                        min="0"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">Обо мне</label>
                                <textarea value={editableUser.about} onChange={(e) => setEditableUser({...editableUser, about: e.target.value})} rows={3} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary no-scrollbar"/>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors">Отмена</button>
                            <button onClick={handleSaveChanges} disabled={isSaving || isCompressing} className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                                <SaveIcon className="w-4 h-4"/> {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteAccountOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsDeleteAccountOpen(false)}>
                    <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in-up text-center border-2 border-red-500" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-2 text-red-500">Удалить аккаунт?</h2>
                        <p className="text-foreground/80 mb-6">
                            Вы уверены? <br/>
                            <span className="font-bold">Все ваши растения, достижения и история будут удалены безвозвратно.</span>
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setIsDeleteAccountOpen(false)} 
                                className="px-6 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors"
                            >
                                Отмена
                            </button>
                            <button 
                                onClick={handleDeleteAccount} 
                                className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                            >
                                Удалить навсегда
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;
