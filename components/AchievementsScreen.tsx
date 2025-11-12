import React from 'react';
import { Achievement, AchievementRarity } from '../types';

interface AchievementsScreenProps {
    achievements: (Achievement & { earnedAt?: Date })[];
}

const RARITY_COLORS: Record<AchievementRarity, string> = {
    [AchievementRarity.COMMON]: 'border-gray-400 text-gray-400',
    [AchievementRarity.RARE]: 'border-blue-400 text-blue-400',
    [AchievementRarity.EPIC]: 'border-purple-500 text-purple-500',
    [AchievementRarity.LEGENDARY]: 'border-yellow-500 text-yellow-500',
};

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ achievements }) => {
    const earnedAchievements = achievements.filter(a => a.earnedAt);
    const unearnedAchievements = achievements.filter(a => !a.earnedAt);

    return (
        <div className="animate-fade-in">
            <h3 className="font-bold mb-2">Полученные ({earnedAchievements.length})</h3>
            <div className="space-y-2 mb-6">
                {earnedAchievements.map(ach => (
                    <div key={ach.id} className={`bg-card border-l-4 ${RARITY_COLORS[ach.rarity].replace('text-', 'border-')} p-3 rounded-lg`}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex-shrink-0">{ach.icon}</div>
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
                            <div className="w-12 h-12 flex-shrink-0">{ach.icon}</div>
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
};

export default AchievementsScreen;