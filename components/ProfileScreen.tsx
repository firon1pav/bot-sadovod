import React, { useState } from 'react';
import { Stats, LevelInfo, UserAchievement, Achievement, Plant, CareEvent, AchievementRarity } from '../types';
import HistoryScreen from './HistoryScreen';
import { AchievementIcon, HistoryIcon, StatsIcon } from './icons';

interface ProfileScreenProps {
    user: { name: string; photoUrl: string };
    stats: Stats;
    levelInfo: LevelInfo;
    achievements: (Achievement & { earnedAt?: Date })[];
    plants: Plant[];
    careEvents: CareEvent[];
}

type ProfileTab = 'stats' | 'achievements' | 'history';

const RARITY_COLORS: Record<AchievementRarity, string> = {
    [AchievementRarity.COMMON]: 'border-gray-400 text-gray-400',
    [AchievementRarity.RARE]: 'border-blue-400 text-blue-400',
    [AchievementRarity.EPIC]: 'border-purple-500 text-purple-500',
    [AchievementRarity.LEGENDARY]: 'border-yellow-500 text-yellow-500',
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, stats, levelInfo, achievements, plants, careEvents }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('stats');
    
    const earnedAchievements = achievements.filter(a => a.earnedAt);
    const unearnedAchievements = achievements.filter(a => !a.earnedAt);

    const renderTabs = () => (
        <div className="flex justify-around bg-card border border-accent rounded-full p-1 mb-6">
            <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full w-full justify-center ${activeTab === 'stats' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}> <StatsIcon className="w-4 h-4" /> Статистика</button>
            <button onClick={() => setActiveTab('achievements')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full w-full justify-center ${activeTab === 'achievements' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}> <AchievementIcon className="w-4 h-4" /> Достижения</button>
            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full w-full justify-center ${activeTab === 'history' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}> <HistoryIcon className="w-4 h-4" /> История</button>
        </div>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'stats':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-card border border-accent p-4 rounded-lg flex justify-between items-center">
                            <span className="font-semibold">Всего поливов</span>
                            <span className="text-xl font-bold text-primary">{stats.totalWaterings}</span>
                        </div>
                        <div className="bg-card border border-accent p-4 rounded-lg flex justify-between items-center">
                            <span className="font-semibold">Текущая серия поливов</span>
                            <span className="text-xl font-bold text-primary">{stats.streakWater} 🔥</span>
                        </div>
                        <div className="bg-card border border-accent p-4 rounded-lg flex justify-between items-center">
                            <span className="font-semibold">Растений в саду</span>
                            <span className="text-xl font-bold text-primary">{plants.length}</span>
                        </div>
                    </div>
                );
            case 'achievements':
                return (
                    <div className="animate-fade-in">
                        <h3 className="font-bold mb-2">Полученные ({earnedAchievements.length})</h3>
                        <div className="space-y-2 mb-6">
                            {earnedAchievements.map(ach => (
                                <div key={ach.id} className={`bg-card border-l-4 ${RARITY_COLORS[ach.rarity].replace('text-', 'border-')} p-3 rounded-lg`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{ach.icon}</span>
                                        <div>
                                            <p className="font-bold">{ach.name}</p>
                                            <p className="text-xs text-foreground/70">{ach.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <h3 className="font-bold mb-2">Неполученные ({unearnedAchievements.length})</h3>
                        <div className="space-y-2 opacity-60">
                            {unearnedAchievements.map(ach => (
                                <div key={ach.id} className={`bg-card border-l-4 ${RARITY_COLORS[ach.rarity].replace('text-', 'border-')} p-3 rounded-lg`}>
                                     <div className="flex items-center gap-3">
                                        <span className="text-2xl">{ach.icon}</span>
                                        <div>
                                            <p className="font-bold">{ach.name}</p>
                                            <p className="text-xs text-foreground/70">{ach.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'history':
                return <HistoryScreen careEvents={careEvents} plants={plants} />;
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col items-center mb-6">
                <img src={user.photoUrl} alt="Аватар пользователя" className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-primary/50" />
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-sm text-foreground/70">{levelInfo.levelName} - Уровень {levelInfo.level}</p>
            </div>
            
            {renderTabs()}
            {renderContent()}
        </div>
    );
};

export default ProfileScreen;
