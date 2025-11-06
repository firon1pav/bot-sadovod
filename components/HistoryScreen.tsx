import React from 'react';
import { Plant, CareEvent, CareType } from '../types';
import { WaterDropIcon, ScissorsIcon, SpadeIcon, FertilizerIcon } from './icons';
import { formatDateGroup, CARE_TYPE_RUSSIAN } from '../utils';

interface HistoryScreenProps {
  careEvents: CareEvent[];
  plants: Plant[];
}

const CARE_TYPE_ICONS: Record<CareType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  [CareType.WATER]: WaterDropIcon,
  [CareType.TRIM]: ScissorsIcon,
  [CareType.REPOT]: SpadeIcon,
  [CareType.FERTILIZE]: FertilizerIcon,
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ careEvents, plants }) => {

  const historyWithPlantNames = careEvents.map(event => {
    const plant = plants.find(p => p.id === event.plantId);
    return { ...event, plantName: plant ? plant.name : 'Неизвестное растение' };
  }).sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const groupedEvents = historyWithPlantNames.reduce((acc, event) => {
    const dateKey = new Date(event.occurredAt).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, typeof historyWithPlantNames>);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">История ухода</h1>
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
                      const Icon = CARE_TYPE_ICONS[event.type];
                      return (
                          <li key={event.id} className="flex items-start bg-card p-3 rounded-lg border border-accent">
                              <Icon className="w-5 h-5 mr-3 mt-1 text-foreground/70" />
                              <div className="flex-grow">
                                  <p>
                                      <span className="font-semibold">{CARE_TYPE_RUSSIAN[event.type]}:</span>
                                      <span className="ml-2">{event.plantName}</span>
                                  </p>
                                  {event.note && (
                                      <p className="text-sm text-foreground/60 mt-1 italic">"{event.note}"</p>
                                  )}
                              </div>
                              <span className="text-xs text-foreground/50 ml-2">{new Date(event.occurredAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
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
          <p className="text-gray-500 dark:text-gray-400">История ухода пока пуста.</p>
          <p className="text-gray-500 dark:text-gray-400">Начните ухаживать за вашими растениями!</p>
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
