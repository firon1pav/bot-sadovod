import React from 'react';
import { Stats, Plant } from '../types';

interface StatsScreenProps {
    stats: Stats;
    plants: Plant[];
}

const StatsScreen: React.FC<StatsScreenProps> = ({ stats, plants }) => {
    const statItems = [
        { label: "Всего поливов", value: stats.totalWaterings },
        { label: "Всего удобрено", value: stats.totalFertilizes },
        { label: "Всего пересажено", value: stats.totalRepots },
        { label: "Всего обрезано", value: stats.totalTrims },
    ];

    return (
        <div className="space-y-4 animate-fade-in">
            {statItems.map(item => (
                <div key={item.label} className="bg-card border border-accent p-4 rounded-lg flex justify-between items-center">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-xl font-bold text-primary">{item.value}</span>
                </div>
            ))}
        </div>
    );
};

export default StatsScreen;