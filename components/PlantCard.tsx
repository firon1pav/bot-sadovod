import React, { useMemo } from 'react';
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
  const daysSinceWatered = (new Date().getTime() - new Date(plant.lastWateredAt).getTime()) / (1000 * 3600 * 24);
  
  const getPlantStatus = () => {
    if (daysSinceWatered > plant.wateringFrequencyDays) {
      return { mood: '🥀', text: 'Жаждет!', color: 'text-red-500' };
    }
    return { mood: '🌿', text: 'Счастливо!', color: 'text-green-500' };
  };

  const upcomingActions = useMemo(() => {
    const actions: { type: CareType; daysUntil: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Water
    if (daysSinceWatered >= plant.wateringFrequencyDays) {
        actions.push({ type: CareType.WATER, daysUntil: 0 });
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
            if (daysUntil >= 0 && daysUntil <= 7) {
                actions.push({ type, daysUntil });
            }
        }
    });

    return actions.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [plant, daysSinceWatered]);

  const status = getPlantStatus();

  return (
    <div 
      className={`bg-card border border-accent rounded-2xl shadow-sm overflow-hidden flex flex-col transition-transform duration-300 ${!isReadOnly ? 'cursor-pointer' : ''}`}
      onClick={!isReadOnly ? () => onSelect(plant) : undefined}
    >
      <img src={plant.photoUrl} alt={plant.name} className="w-full h-32 object-cover" />
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
              <div className="flex -mx-1">
                {upcomingActions.map(({ type, daysUntil }) => {
                  const { Icon, name } = CARE_ACTION_DETAILS[type];
                  const dueText = daysUntil === 0 ? 'Сегодня' : `${daysUntil} д.`;
                  
                  return (
                    <div key={type} className="px-1 w-1/2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLogCare(plant.id, type);
                        }}
                        title={`${name} - ${dueText}`}
                        className="w-full flex items-center justify-center gap-1.5 bg-accent/60 text-foreground font-semibold p-2 rounded-lg text-xs hover:bg-accent transition-colors"
                      >
                        <Icon className={`w-4 h-4 ${type === CareType.WATER ? 'text-blue-500' : 'text-primary'} flex-shrink-0`} />
                        <span>{dueText}</span>
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