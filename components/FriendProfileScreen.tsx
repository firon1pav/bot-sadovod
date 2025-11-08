import React, { useState } from 'react';
import { User, Plant, LevelInfo } from '../types';
import { BackIcon, CakeIcon, ProfileIcon as GenderIcon, TrashIcon, PaperAirplaneIcon, AtSymbolIcon } from './icons';
import PlantCard from './PlantCard';

interface FriendProfileScreenProps {
    friend: User;
    plants: Plant[];
    levelInfo: LevelInfo; // Note: This should ideally be the friend's level info
    onBack: () => void;
    onRemoveFriend: (friendId: string) => void;
}

const FriendProfileScreen: React.FC<FriendProfileScreenProps> = ({ friend, plants, levelInfo, onBack, onRemoveFriend }) => {
    const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
    
    const genderMap = {
        male: 'Мужской',
        female: 'Женский',
    };

    const handleConfirmRemove = () => {
        onRemoveFriend(friend.id);
        setIsConfirmingRemove(false);
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-accent -ml-2">
                    <BackIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-center truncate px-2">{friend.name}</h1>
                {friend.telegramUsername ? (
                    <a 
                        href={`https://t.me/${friend.telegramUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-accent -mr-2"
                        aria-label={`Написать сообщение для ${friend.name} в Telegram`}
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </a>
                ) : (
                    <div className="w-9 h-9 -mr-2"></div> // Placeholder for alignment
                )}
            </div>

            <div className="px-4 pb-4">
                {/* User Info */}
                <div className="flex flex-col items-center mb-6">
                    <img src={friend.photoUrl} alt={`Аватар ${friend.name}`} className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-primary/50" />
                    <p className="text-sm text-foreground/70">{levelInfo.levelName} - Уровень {levelInfo.level}</p>
                </div>

                 <div className="bg-card border border-accent rounded-lg p-4 mb-6 space-y-4">
                    <div className="space-y-2 text-sm text-foreground/80">
                         <div className="flex items-center gap-2">
                            <GenderIcon className="w-4 h-4" />
                            <span>Пол: {genderMap[friend.gender]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CakeIcon className="w-4 h-4" />
                            <span>Возраст: {friend.age}</span>
                        </div>
                        {friend.telegramUsername && (
                            <div className="flex items-center gap-2">
                                <AtSymbolIcon className="w-4 h-4" />
                                <span>{friend.telegramUsername}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">О {friend.name}</h3>
                        <p className="text-sm text-foreground/80">{friend.about}</p>
                    </div>
                </div>

                {/* Friend's Garden */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Сад {friend.name}</h2>
                    {plants.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {plants.map(plant => (
                                <PlantCard 
                                    key={plant.id} 
                                    plant={plant} 
                                    onLogCare={() => {}} 
                                    onSelect={() => {}} 
                                    isReadOnly={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-card border border-accent rounded-lg">
                            <p className="text-foreground/60">У {friend.name} пока нет растений.</p>
                        </div>
                    )}
                </div>

                {/* Remove Friend Button */}
                <div className="mt-8 border-t border-red-500/20 pt-6">
                    <button
                        onClick={() => setIsConfirmingRemove(true)}
                        className="w-full flex items-center justify-center gap-2 text-center px-4 py-2.5 bg-red-500/10 text-red-500 rounded-lg font-semibold hover:bg-red-500/20 transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                        Удалить из друзей
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isConfirmingRemove && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsConfirmingRemove(false)}>
                    <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in-up text-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-2">Удалить друга?</h2>
                        <p className="text-foreground/80 mb-6">
                            Вы уверены, что хотите удалить {friend.name} из друзей?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setIsConfirmingRemove(false)} 
                                className="px-6 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors"
                            >
                                Отмена
                            </button>
                            <button 
                                onClick={handleConfirmRemove} 
                                className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendProfileScreen;