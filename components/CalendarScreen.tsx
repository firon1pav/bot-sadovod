

import React, { useState, useMemo } from 'react';
import { Plant, CareType } from '../types';
import { WaterDropIcon, ScissorsIcon, SpadeIcon, FertilizerIcon, BackIcon, MoreHorizontalIcon } from './icons';
import { startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, format, isSameDay, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CalendarScreenProps {
  plants: Plant[];
}

interface CalendarEvent {
  plantId: string;
  plantName: string;
  careType: CareType;
  dueDate: Date;
}

const CARE_TYPE_CONFIG = {
    [CareType.WATER]: { icon: WaterDropIcon, text: 'Полить', color: 'text-blue-500', bgColor: 'bg-blue-500' },
    [CareType.TRIM]: { icon: ScissorsIcon, text: 'Обрезать', color: 'text-orange-500', bgColor: 'bg-orange-500' },
    [CareType.REPOT]: { icon: SpadeIcon, text: 'Пересадить', color: 'text-yellow-700', bgColor: 'bg-yellow-700' },
    [CareType.FERTILIZE]: { icon: FertilizerIcon, text: 'Удобрить', color: 'text-purple-500', bgColor: 'bg-purple-500' },
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ plants }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Generate all upcoming events
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    plants.forEach(plant => {
         // Water
         const nextWater = new Date(new Date(plant.lastWateredAt).getTime() + plant.wateringFrequencyDays * 24 * 60 * 60 * 1000);
         events.push({ plantId: plant.id, plantName: plant.name, careType: CareType.WATER, dueDate: nextWater });

         // Others
         if (plant.nextFertilizingDate) events.push({ plantId: plant.id, plantName: plant.name, careType: CareType.FERTILIZE, dueDate: new Date(plant.nextFertilizingDate) });
         if (plant.nextRepottingDate) events.push({ plantId: plant.id, plantName: plant.name, careType: CareType.REPOT, dueDate: new Date(plant.nextRepottingDate) });
         if (plant.nextTrimmingDate) events.push({ plantId: plant.id, plantName: plant.name, careType: CareType.TRIM, dueDate: new Date(plant.nextTrimmingDate) });
    });
    return events;
  }, [plants]);

  const getEventsForDate = (date: Date) => {
      return allEvents.filter(e => isSameDay(e.dueDate, date));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Календарь ухода</h1>

      {/* Week Navigation */}
      <div className="bg-card border border-accent rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
              <button onClick={prevWeek} className="p-2 hover:bg-accent rounded-full">
                  <BackIcon className="w-5 h-5" />
              </button>
              <h2 className="font-bold capitalize">
                  {format(currentDate, 'LLLL yyyy', { locale: ru })}
              </h2>
              <button onClick={nextWeek} className="p-2 hover:bg-accent rounded-full rotate-180">
                   <BackIcon className="w-5 h-5" />
              </button>
          </div>

          <div className="flex justify-between">
              {weekDays.map(day => {
                  const events = getEventsForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                      <button 
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                            flex flex-col items-center justify-center w-10 h-16 rounded-xl transition-all
                            ${isSelected ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'hover:bg-accent'}
                            ${isTodayDate && !isSelected ? 'border border-primary text-primary' : ''}
                        `}
                      >
                          <span className="text-xs font-medium capitalize mb-1">
                              {format(day, 'EE', { locale: ru })}
                          </span>
                          <span className="text-lg font-bold">
                              {format(day, 'd')}
                          </span>
                          
                          {/* Dots for events */}
                          <div className="flex gap-0.5 mt-1">
                              {events.slice(0, 3).map((e, i) => (
                                  <div 
                                    key={i} 
                                    className={`w-1 h-1 rounded-full ${CARE_TYPE_CONFIG[e.careType].bgColor} ${isSelected ? 'bg-white' : ''}`} 
                                  />
                              ))}
                          </div>
                      </button>
                  );
              })}
          </div>
      </div>

      {/* Events List for Selected Date */}
      <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground/80">
              {isToday(selectedDate) ? 'Сегодня' : format(selectedDate, 'd MMMM', { locale: ru })}
          </h3>
          
          {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event, idx) => {
                  const config = CARE_TYPE_CONFIG[event.careType];
                  const Icon = config.icon;
                  return (
                    <div key={`${event.plantId}-${idx}`} className="flex items-center bg-card p-4 rounded-xl border border-accent animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className={`p-3 rounded-full bg-accent/50 mr-4 ${config.color}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">{event.plantName}</p>
                            <p className={`text-sm ${config.color} font-medium`}>{config.text}</p>
                        </div>
                    </div>
                  );
              })
          ) : (
              <div className="text-center py-10 bg-card border border-accent rounded-xl border-dashed">
                  <p className="text-foreground/50">На этот день задач нет 🌱</p>
                  <p className="text-xs text-foreground/40 mt-1">Отдыхайте и наслаждайтесь садом!</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default CalendarScreen;