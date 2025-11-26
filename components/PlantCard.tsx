

import React, { useMemo, useState } from 'react';
import { Plant, CareType, PlantLocation } from '../types';
import { WaterDropIcon, LocationIcon, ScissorsIcon, SpadeIcon, FertilizerIcon } from './icons';
import { PLANT_LOCATION_RUSSIAN } from '../utils';

interface PlantCardProps {
  plant: Plant;
  onLogCare: (plantId: string, careType: CareType) => void;
  onSelect: (plant: Plant) => void;
  isReadOnly?: boolean;
}

const CARE_ACTION_DETAILS: Record<string, { Icon: React.FC<any>, name: string }> = {
    [CareType.WATER]: { Icon: WaterDropIcon, name: 'Полив' },
    [CareType.FERTILIZE]: { Icon: FertilizerIcon, name: 'Удобрение' },
    [CareType.REPOT]: { Icon: SpadeIcon, name: 'Пересадка' },
    [CareType.TRIM]: { Icon: ScissorsIcon, name: 'Обрезка' },
};

const PlantCard: React.FC<PlantCardProps> = ({ plant, onLogCare, onSelect, isReadOnly = false }) => {
  const [activeAnimation, setActiveAnimation] = useState<CareType | null>(null);
  
  const daysSinceWatered = (new Date().getTime() - new Date(plant.lastWateredAt).getTime()) / (1000 * 3600 * 24);
  
  const getPlantStatus = () => {
    if (daysSinceWatered > plant.wateringFrequencyDays) {
      return { mood: '🥀', text: 'Жаждет!', color: 'text-red-500' };
    }
    return { mood: '🌿', text: 'Счастливо!', color: 'text-green-500' };
  };

  const handleCare = (e: React.MouseEvent, type: CareType) => {
    e.stopPropagation();
    onLogCare(plant.id, type);

    setActiveAnimation(type);
    
    // Different durations or logic could be applied here
    setTimeout(() => setActiveAnimation(null), 1000);
  };

  const upcomingActions = useMemo(() => {
    const actions: { type: CareType; daysUntil: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Water: Show if due today, overdue, or due tomorrow (daysUntil <= 1)
    const nextWaterDate = new Date(new Date(plant.lastWateredAt).getTime() + plant.wateringFrequencyDays * 24 * 60 * 60 * 1000);
    nextWaterDate.setHours(0, 0, 0, 0);
    
    const diffTime = nextWaterDate.getTime() - today.getTime();
    const daysUntilWater = Math.ceil(diffTime / (1000 * 3600 * 24));

    if (daysUntilWater <= 1) {
        actions.push({ type: CareType.WATER, daysUntil: daysUntilWater });
    }

    // Other actions
    const otherCareTypes: { type: CareType; date: Date | undefined }[] = [
        { type: CareType.FERTILIZE, date: plant.nextFertilizingDate },
        { type: CareType.REPOT, date: plant.nextRepottingDate },
        { type: CareType.TRIM, date: plant.nextTrimmingDate },
    ];

    otherCareTypes.forEach(({ type, date }) => {
        if (date) {
            const dueDate = new Date(date);
            dueDate.setHours(0, 0, 0, 0);
            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            // Show events coming up in the next 7 days
            if (daysUntil >= 0 && daysUntil <= 7) {
                actions.push({ type, daysUntil });
            }
        }
    });

    return actions.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [plant]);

  const status = getPlantStatus();

  return (
    <div 
      className={`relative bg-card border border-accent rounded-2xl shadow-sm overflow-hidden flex flex-col transition-transform duration-300 ${!isReadOnly ? 'cursor-pointer' : ''} ${activeAnimation === CareType.REPOT ? 'animate-wiggle' : ''} ${activeAnimation === CareType.TRIM ? 'animate-pop' : ''}`}
      onClick={!isReadOnly ? () => onSelect(plant) : undefined}
    >
      <div className="relative h-32 w-full group">
         <img src={plant.photoUrl} alt={plant.name} className="w-full h-full object-cover" />
         
         {/* Animation Overlays */}
         {activeAnimation === CareType.WATER && (
             <div className="absolute inset-0 z-10 flex justify-around items-start overflow-hidden pointer-events-none bg-blue-500/10">
                 {[...Array(5)].map((_, i) => (
                     <div 
                        key={i} 
                        className="animate-rain text-blue-500" 
                        style={{ 
                            animationDelay: `${i * 0.1}s`, 
                            marginLeft: `${Math.random() * 20}px` 
                        }}
                     >
                        💧
                     </div>
                 ))}
             </div>
         )}
         
         {activeAnimation === CareType.FERTILIZE && (
             <div className="absolute inset-0 z-10 flex justify-center items-center overflow-hidden pointer-events-none">
                 {[...Array(6)].map((_, i) => (
                     <div 
                        key={i} 
                        className="animate-sparkle absolute text-yellow-400" 
                        style={{ 
                            animationDelay: `${i * 0.1}s`, 
                            left: `${50 + (Math.random() * 60 - 30)}%`,
                            top: `${50 + (Math.random() * 60 - 30)}%`,
                        }}
                     >
                        ✨
                     </div>
                 ))}
             </div>
         )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-md truncate">{plant.name}</h3>
        <div className="flex items-center text-xs text-foreground/60 mt-1">
          <LocationIcon className="w-3 h-3 mr-1" />
          <span className="capitalize">
            {plant.location === PlantLocation.OTHER && plant.customLocation 
                ? plant.customLocation 
                : PLANT_LOCATION_RUSSIAN[plant.location]}
          </span>
        </div>
        <div className="flex items-center mt-2">
            <span className="text-xl">{status.mood}</span>
            <span className={`text-xs font-semibold ml-2 ${status.color}`}>{status.text}</span>
        </div>
        
        <div className="mt-auto pt-3">
          {!isReadOnly && upcomingActions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground/60 mb-1">Требуется уход:</p>
              <div className="flex -mx-1 overflow-x-auto no-scrollbar">
                {upcomingActions.map(({ type, daysUntil }) => {
                  const { Icon, name } = CARE_ACTION_DETAILS[type];
                  let dueText = '';
                  if (daysUntil < 0) dueText = 'Просрочено';
                  else if (daysUntil === 0) dueText = 'Сегодня';
                  else if (daysUntil === 1) dueText = 'Завтра';
                  else dueText = `${daysUntil} д.`;
                  
                  return (
                    <div key={type} className="px-1 w-1/2 flex-shrink-0">
                      <button
                        onClick={(e) => handleCare(e, type)}
                        title={`${name} - ${dueText}`}
                        className="w-full flex items-center justify-center gap-1.5 bg-accent/60 text-foreground font-semibold p-2 rounded-lg text-xs hover:bg-accent transition-colors active:scale-95"
                      >
                        <Icon className={`w-4 h-4 ${type === CareType.WATER ? 'text-blue-500' : (type === CareType.FERTILIZE ? 'text-purple-500' : (type === CareType.TRIM ? 'text-orange-500' : 'text-primary'))} flex-shrink-0`} />
                        <span>{daysUntil <= 1 ? dueText : `${daysUntil}д`}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantCard;