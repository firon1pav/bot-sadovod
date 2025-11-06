import React from 'react';
import { Plant, CareType } from '../types';
import { WaterDropIcon, ScissorsIcon, SpadeIcon, FertilizerIcon } from './icons';
import { formatDateGroup } from '../utils';

interface CalendarScreenProps {
  plants: Plant[];
}

interface UpcomingEvent {
  plantId: string;
  plantName: string;
  careType: CareType;
  dueDate: Date;
}

const CARE_TYPE_CONFIG = {
    [CareType.WATER]: { icon: WaterDropIcon, text: 'Полить', color: 'text-blue-500' },
    [CareType.TRIM]: { icon: ScissorsIcon, text: 'Обрезать', color: 'text-orange-500' },
    [CareType.REPOT]: { icon: SpadeIcon, text: 'Пересадить', color: 'text-yellow-700' },
    [CareType.FERTILIZE]: { icon: FertilizerIcon, text: 'Удобрить', color: 'text-purple-500' },
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ plants }) => {
  const upcomingEvents = plants
    .map(plant => ({
      plantId: plant.id,
      plantName: plant.name,
      careType: CareType.WATER,
      dueDate: new Date(new Date(plant.lastWateredAt).getTime() + plant.wateringFrequencyDays * 24 * 60 * 60 * 1000),
    }))
    .filter(event => event.dueDate >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const groupedEvents = upcomingEvents.reduce((acc, event) => {
    const dateKey = event.dueDate.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, UpcomingEvent[]>);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Календарь ухода</h1>
      {Object.keys(groupedEvents).length > 0 ? (
        <div className="space-y-6">
          {/* FIX: Use Object.keys().map() to avoid a type inference issue with Object.entries() which caused events to be typed as unknown. */}
          {Object.keys(groupedEvents).map((dateKey) => {
            const events = groupedEvents[dateKey];
            return (
              <div key={dateKey}>
                <h2 className="font-bold text-lg mb-2 text-primary">{formatDateGroup(new Date(dateKey))}</h2>
                <ul className="space-y-2">
                  {events.map(event => {
                      const config = CARE_TYPE_CONFIG[event.careType];
                      const Icon = config.icon;
                      return (
                          <li key={`${event.plantId}-${event.careType}`} className="flex items-center bg-card p-3 rounded-lg border border-accent">
                              <Icon className={`w-6 h-6 mr-3 ${config.color}`} />
                              <div>
                                  <span className="font-semibold">{config.text}:</span>
                                  <span className="ml-2">{event.plantName}</span>
                              </div>
                          </li>
                      );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Предстоящих событий нет.</p>
          <p className="text-gray-500 dark:text-gray-400">Все ваши растения в порядке!</p>
        </div>
      )}
    </div>
  );
};

export default CalendarScreen;
