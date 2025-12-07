
import React, { useState, useMemo } from 'react';
import { Plant, CareType } from '../types';
import { WaterDropIcon, ScissorsIcon, SpadeIcon, FertilizerIcon, BackIcon, MoreHorizontalIcon } from './icons';
import { startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, format, isSameDay, isToday, addDays, differenceInCalendarDays } from 'date-fns';
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

  // Generate all upcoming events for the current week range
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    // Define the view window
    const viewStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const viewEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    viewStart.setHours(0, 0, 0, 0);
    viewEnd.setHours(23, 59, 59, 999);

    plants.forEach(plant => {
         // --- WATERING (Recurring) ---
         // STRICT CHECK: Frequency must be > 0 to avoid infinite loops and infinite events per day
         if (plant.wateringFrequencyDays > 0) {
             const lastWatered = new Date(plant.lastWateredAt);
             lastWatered.setHours(0,0,0,0);

             // Start projecting events from the last watered date
             let iterDate = addDays(lastWatered, plant.wateringFrequencyDays);
             
             // Optimization: Fast-forward to near viewStart using Calendar Days diff
             if (iterDate.getTime() < viewStart.getTime()) {
                 const diffDays = differenceInCalendarDays(viewStart, iterDate);
                 // Round up to nearest frequency multiple
                 const jumps = Math.ceil(diffDays / plant.wateringFrequencyDays);
                 if (jumps > 0) {
                     iterDate = addDays(iterDate, jumps * plant.wateringFrequencyDays);
                 }
             }

             // Generate events until we pass the viewEnd
             // SAFETY BREAK: Limit iterations to prevent infinite loops (max 30 events per plant per week)
             let iterations = 0;
             while (iterDate <= viewEnd && iterations < 30) {
                 // Check if valid range
                 if (iterDate >= lastWatered) {
                     events.push({ 
                         plantId: plant.id, 
                         plantName: plant.name, 
                         careType: CareType.WATER, 
                         dueDate: new Date(iterDate) 
                     });
                 }
                 // IMPORTANT: Always advance date, ensuring we break the loop
                 iterDate = addDays(iterDate, plant.wateringFrequencyDays);
                 iterations++;
             }
         }

         // --- OTHER EVENTS (Single scheduled dates) ---
         // For these, we just check if the specific date falls in the range
         if (plant.nextFertilizingDate) {
             const date = new Date(plant.nextFertilizingDate);
             if (date >= viewStart && date <= viewEnd) {
                 events.push({ plantId: plant.id, plantName: plant.name, careType: CareType.FERTILIZE, dueDate: date });
             }
         }
         if (plant.nextRepottingDate) {
             const date = new Date(plant.nextRepottingDate);
             if (date >= viewStart && date <= viewEnd) {
                 events.push({ plantId: plant.id, plantName: plant.name, careType: CareType.REPOT, dueDate: date });
             }
         }
         if (plant.nextTrimmingDate) {
             const date = new Date(plant.nextTrimmingDate);
             if (date >= viewStart && date <= viewEnd) {
                 events.push({ plantId: plant.id, plantName: plant.name, careType: CareType.TRIM, dueDate: date });
             }
         }
    });
    return events;
  }, [plants, currentDate]);

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
