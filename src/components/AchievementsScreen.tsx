
import React, { useState } from 'react';
import { Achievement, AchievementRarity } from '../types';
import { ChevronDownIcon, ChevronUpIcon, TrophyIcon, CloseIcon, LockIcon } from './icons';

interface AchievementsScreenProps {
    achievements: (Achievement & { earnedAt?: Date })[];
}

// Visual configurations for different rarities
const RARITY_STYLES: Record<AchievementRarity, { bg: string, border: string, text: string, shadow: string, label: string }> = {
    [AchievementRarity.COMMON]: { 
        bg: 'bg-gradient-to-br from-slate-100 to-slate-200', 
        border: 'border-slate-300', 
        text: 'text-slate-600',
        shadow: 'shadow-sm',
        label: 'Обычное'
    },
    [AchievementRarity.RARE]: { 
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
        border: 'border-blue-300', 
        text: 'text-blue-600',
        shadow: 'shadow-blue-200',
        label: 'Редкое'
    },
    [AchievementRarity.EPIC]: { 
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100', 
        border: 'border-purple-300', 
        text: 'text-purple-600',
        shadow: 'shadow-purple-200',
        label: 'Эпическое'
    },
    [AchievementRarity.LEGENDARY]: { 
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100', 
        border: 'border-amber-400', 
        text: 'text-amber-600',
        shadow: 'shadow-amber-200 shadow-md',
        label: 'Легендарное'
    },
};

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ achievements }) => {
    const [showUnearned, setShowUnearned] = useState(false);
    const [selectedAch, setSelectedAch] = useState<(Achievement & { earnedAt?: Date }) | null>(null);

    // Sort: Earned first (Legendary -> Common), then Unearned
    const earnedAchievements = achievements
        .filter(a => a.earnedAt)
        .sort((a, b) => {
            // Sort by Rarity weight if needed, currently just by date desc
            return new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime();
        });
    
    const unearnedAchievements = achievements.filter(a => !a.earnedAt);
    const progressPercent = Math.round((earnedAchievements.length / achievements.length) * 100);

    return (
        <div className="animate-fade-in pb-10">
            {/* Header / Summary */}
            <div className="bg-card border border-accent p-5 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                
                <div className="flex justify-between items-end mb-2 relative z-10">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <TrophyIcon className="w-6 h-6 text-yellow-500" />
                            Зал Славы
                        </h3>
                        <p className="text-xs text-foreground/60 mt-1">Ваш прогресс садовода</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-primary">{earnedAchievements.length}</span>
                        <span className="text-sm text-foreground/50 font-medium">/{achievements.length}</span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-accent/50 rounded-full h-3 mt-2 overflow-hidden relative z-10">
                    <div 
                        className="bg-gradient-to-r from-primary to-green-400 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <p className="text-[10px] text-right mt-1 text-foreground/40">{progressPercent}% завершено</p>
            </div>

            {/* Earned Grid */}
            {earnedAchievements.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                    {earnedAchievements.map(ach => {
                        const style = RARITY_STYLES[ach.rarity];
                        return (
                            <button 
                                key={ach.id} 
                                onClick={() => setSelectedAch(ach)}
                                className={`
                                    relative flex flex-col items-center justify-center p-2 rounded-xl border aspect-square transition-transform active:scale-95
                                    ${style.bg} ${style.border} ${style.shadow}
                                `}
                            >
                                <div className="text-3xl mb-1 filter drop-shadow-sm transform hover:scale-110 transition-transform">
                                    {ach.icon}
                                </div>
                                <div className={`text-[9px] font-bold uppercase tracking-wider ${style.text} truncate w-full text-center`}>
                                    {ach.name}
                                </div>
                                {ach.rarity === AchievementRarity.LEGENDARY && (
                                    <div className="absolute inset-0 rounded-xl border-2 border-yellow-400/50 animate-pulse pointer-events-none"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-foreground/50 border-2 border-dashed border-accent rounded-xl mb-6">
                    <div className="text-4xl mb-2 grayscale opacity-50">🏆</div>
                    <p>Пока нет достижений.</p>
                    <p className="text-xs">Полейте растение, чтобы получить первое!</p>
                </div>
            )}

            {/* Unearned Toggle */}
            <div className="mt-4">
                <button 
                    onClick={() => setShowUnearned(!showUnearned)}
                    className="w-full flex items-center justify-between p-4 bg-card border border-accent rounded-xl transition-colors hover:bg-accent/50 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-foreground/40 group-hover:text-foreground/60">
                            <LockIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-sm text-foreground/80">Неполученные</p>
                            <p className="text-xs text-foreground/50">{unearnedAchievements.length} заблокировано</p>
                        </div>
                    </div>
                    {showUnearned ? <ChevronUpIcon className="w-5 h-5 text-foreground/50" /> : <ChevronDownIcon className="w-5 h-5 text-foreground/50" />}
                </button>

                {/* Unearned List */}
                {showUnearned && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                        {unearnedAchievements.map(ach => (
                            <div 
                                key={ach.id} 
                                className="flex items-center gap-4 p-3 bg-accent/20 rounded-xl border border-transparent opacity-60 grayscale hover:opacity-80 transition-opacity"
                            >
                                <div className="text-2xl w-10 text-center">{ach.icon}</div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-sm text-foreground/70">{ach.name}</h4>
                                    <p className="text-xs text-foreground/50">{ach.description}</p>
                                </div>
                                <div className="text-[10px] px-2 py-1 bg-accent rounded text-foreground/50 font-bold uppercase">
                                    {RARITY_STYLES[ach.rarity].label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedAch && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6" onClick={() => setSelectedAch(null)}>
                    <div 
                        className={`
                            relative w-full max-w-sm p-6 rounded-3xl shadow-2xl animate-pop text-center
                            bg-white text-slate-800
                            border-4 ${RARITY_STYLES[selectedAch.rarity].border}
                        `}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setSelectedAch(null)} className="absolute top-3 right-3 p-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors">
                            <CloseIcon className="w-5 h-5 text-slate-500" />
                        </button>

                        <div className={`
                            w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 text-6xl shadow-inner
                            ${RARITY_STYLES[selectedAch.rarity].bg}
                        `}>
                            {selectedAch.icon}
                        </div>

                        <div className={`
                            inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2
                            ${RARITY_STYLES[selectedAch.rarity].bg} ${RARITY_STYLES[selectedAch.rarity].text} border ${RARITY_STYLES[selectedAch.rarity].border}
                        `}>
                            {RARITY_STYLES[selectedAch.rarity].label}
                        </div>

                        <h2 className="text-2xl font-black mb-2 leading-tight">{selectedAch.name}</h2>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{selectedAch.description}</p>

                        <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 font-mono">
                            Получено: {new Date(selectedAch.earnedAt!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementsScreen;
