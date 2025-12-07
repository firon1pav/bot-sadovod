
import React from 'react';
import { DailyQuest } from '../types';
import { StarIcon, CheckIcon } from './icons';
import { api } from '../services/api';
import { triggerHaptic } from '../utils';

interface DailyQuestsWidgetProps {
    quests: DailyQuest[];
    onQuestCompleted: (questId: string, xp: number) => void;
}

const DailyQuestsWidget: React.FC<DailyQuestsWidgetProps> = ({ quests, onQuestCompleted }) => {
    
    const handleClaim = async (quest: DailyQuest) => {
        if (quest.isCompleted) return;
        try {
            await api.completeQuest(quest.id);
            triggerHaptic('success');
            onQuestCompleted(quest.id, quest.xpReward);
        } catch (e) {
            console.error("Claim failed", e);
        }
    };

    if (!quests || quests.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span> Ежедневные задания
            </h3>
            <div className="space-y-3">
                {quests.map(quest => (
                    <div 
                        key={quest.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            quest.isCompleted 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-card border-accent'
                        }`}
                    >
                        <div className="flex-1">
                            <p className={`font-semibold text-sm ${quest.isCompleted ? 'text-foreground/60 line-through' : ''}`}>
                                {quest.title}
                            </p>
                            <p className="text-xs text-foreground/70">{quest.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                                <StarIcon className="w-3 h-3" />
                                <span>+{quest.xpReward}</span>
                            </div>
                            <button
                                onClick={() => handleClaim(quest)}
                                disabled={quest.isCompleted}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    quest.isCompleted 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-accent hover:bg-primary hover:text-white'
                                }`}
                            >
                                {quest.isCompleted ? <CheckIcon className="w-5 h-5"/> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyQuestsWidget;
