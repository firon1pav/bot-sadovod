import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plant, CareType, PlantLocation, PlantType } from '../types';
import { BackIcon, EditIcon, SaveIcon, CloseIcon, WaterDropIcon, ScissorsIcon, SpadeIcon, FertilizerIcon, UploadIcon, CalendarIcon, TrashIcon } from './icons';
import { PLANT_LOCATION_RUSSIAN, PLANT_TYPE_RUSSIAN } from '../utils';
import { PLANT_LOCATIONS_OPTIONS, PLANT_TYPES_OPTIONS } from '../constants';

interface EditableSchedule {
    wateringFrequencyDays?: number;
    nextFertilizingDate?: string;
    nextRepottingDate?: string;
    nextTrimmingDate?: string;
}

interface PlantDetailScreenProps {
  plant: Plant;
  onBack: () => void;
  onUpdatePlant: (plantId: string, updatedData: Partial<Omit<Plant, 'id'>>) => void;
  onLogCareEvent: (plantId: string, type: CareType) => void;
  onDeletePlant: (plantId: string) => void;
}

const PlantDetailScreen: React.FC<PlantDetailScreenProps> = ({ plant, onBack, onUpdatePlant, onLogCareEvent, onDeletePlant }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editablePlant, setEditablePlant] = useState(plant);
    
    const initialSchedule = useMemo(() => ({
        wateringFrequencyDays: plant.wateringFrequencyDays,
        nextFertilizingDate: plant.nextFertilizingDate?.toISOString().split('T')[0],
        nextRepottingDate: plant.nextRepottingDate?.toISOString().split('T')[0],
        nextTrimmingDate: plant.nextTrimmingDate?.toISOString().split('T')[0],
    }), [plant]);

    const [schedule, setSchedule] = useState<EditableSchedule>(initialSchedule);
    const [isScheduleDirty, setIsScheduleDirty] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditablePlant(plant);
        setSchedule(initialSchedule);
        setIsScheduleDirty(false);
    }, [plant, initialSchedule]);
    
    const formatDateForDisplay = (dateString: string | undefined): string => {
        if (!dateString) return 'дд.мм.гггг';
        try {
            const [year, month, day] = dateString.split('-');
            if (!day || !month || !year) return 'дд.мм.гггг';
            return `${day}.${month}.${year}`;
        } catch {
            return 'дд.мм.гггг'
        }
    };

    const handleSaveChanges = () => {
        const dataToUpdate = { ...editablePlant };
        if (dataToUpdate.location !== PlantLocation.OTHER) {
            dataToUpdate.customLocation = undefined;
        }
        if (dataToUpdate.type !== PlantType.OTHER) {
            dataToUpdate.customType = undefined;
        }
        onUpdatePlant(plant.id, dataToUpdate);
        setIsEditModalOpen(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newPhotoUrl = URL.createObjectURL(file);
            onUpdatePlant(plant.id, { photoUrl: newPhotoUrl });
        }
    };
    
    const handleScheduleChange = (key: keyof EditableSchedule, value: string) => {
        setIsScheduleDirty(true);
        if (key === 'wateringFrequencyDays') {
            const numValue = parseInt(value, 10);
            setSchedule(prev => ({ ...prev, [key]: isNaN(numValue) || numValue <= 0 ? undefined : numValue }));
        } else {
            setSchedule(prev => ({ ...prev, [key]: value || undefined }));
        }
    };

    const handleSaveSchedule = () => {
        const updatedData: Partial<Plant> = {
            wateringFrequencyDays: schedule.wateringFrequencyDays,
            nextFertilizingDate: schedule.nextFertilizingDate ? new Date(schedule.nextFertilizingDate) : undefined,
            nextRepottingDate: schedule.nextRepottingDate ? new Date(schedule.nextRepottingDate) : undefined,
            nextTrimmingDate: schedule.nextTrimmingDate ? new Date(schedule.nextTrimmingDate) : undefined,
        };
        onUpdatePlant(plant.id, updatedData);
        setIsScheduleDirty(false);
    };
    
    const handleConfirmDelete = () => {
        onDeletePlant(plant.id);
    };

    const careActions = useMemo(() => [
        { type: CareType.WATER, Icon: WaterDropIcon, label: 'Полить', lastActionDate: plant.lastWateredAt },
        { type: CareType.FERTILIZE, Icon: FertilizerIcon, label: 'Удобрить', lastActionDate: plant.lastFertilizedAt },
        { type: CareType.REPOT, Icon: SpadeIcon, label: 'Пересадить', lastActionDate: plant.lastRepottedAt },
        { type: CareType.TRIM, Icon: ScissorsIcon, label: 'Обрезать', lastActionDate: plant.lastTrimmedAt },
    ], [plant]);
    
    // FIX: Using `as const` allows TypeScript to infer the literal types for `key` and `type`,
    // which enables type narrowing and fixes the error when calling `handleScheduleChange`.
    const scheduleItems = [
        { label: 'Полив', key: 'wateringFrequencyDays', type: 'number', placeholder: 'дней' },
        { label: 'Подкормка', key: 'nextFertilizingDate', type: 'date', placeholder: '' },
        { label: 'Пересадка', key: 'nextRepottingDate', type: 'date', placeholder: '' },
        { label: 'Обрезка', key: 'nextTrimmingDate', type: 'date', placeholder: '' },
    ] as const;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-accent -ml-2">
                    <BackIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-center truncate px-2">{plant.name}</h1>
                <button onClick={() => setIsEditModalOpen(true)} className="p-2 rounded-full hover:bg-accent -mr-2">
                    <EditIcon className="w-5 h-5" />
                </button>
            </div>
            
            {/* Photo */}
            <div className="relative mb-6">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*" />
                <img src={plant.photoUrl} alt={plant.name} className="w-full h-64 object-cover rounded-2xl" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-3 bg-card/80 text-card-foreground p-2 rounded-full shadow-lg hover:bg-card flex items-center gap-2 text-sm px-3">
                    <UploadIcon className="w-4 h-4" />
                    Загрузить
                </button>
            </div>
            
            {/* Log Care Actions */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Журнал ухода</h2>
                <div className="grid grid-cols-4 gap-2 text-center">
                    {careActions.map(({ type, Icon, label }) => (
                        <button key={type} onClick={() => onLogCareEvent(plant.id, type)} className="flex flex-col items-center justify-center h-full p-2 bg-card border border-accent rounded-lg hover:bg-accent transition-colors">
                            <Icon className={`w-6 h-6 mb-1 ${type === CareType.WATER ? 'text-blue-500' : 'text-primary'}`} />
                            <span className="text-xs">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Care Schedule */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Планирование ухода</h2>
                <div className="space-y-3 bg-card border border-accent rounded-lg p-4">
                     {scheduleItems.map(({ label, key, type, placeholder }) => (
                        <div key={key} className="flex items-center justify-between">
                            <label className="text-sm">{label}</label>
                            {type === 'number' ? (
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={schedule[key] || ''}
                                        onChange={e => handleScheduleChange(key, e.target.value)}
                                        className="w-28 bg-accent border-none rounded-lg pl-3 pr-12 py-1.5 text-center focus:ring-2 focus:ring-primary"
                                        placeholder="-"
                                        min="1"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground/50">{placeholder}</span>
                                 </div>
                            ) : (
                                <div className="relative w-36">
                                    <div className={`flex items-center justify-between w-full bg-accent border-transparent rounded-lg px-3 py-1.5 text-center cursor-pointer text-sm ${!schedule[key] && 'text-foreground/50'}`}>
                                        <span>{formatDateForDisplay(schedule[key])}</span>
                                        <CalendarIcon className="w-4 h-4 text-foreground/60" />
                                    </div>
                                    <input
                                        type="date"
                                        value={schedule[key] || ''}
                                        onChange={e => handleScheduleChange(key, e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {isScheduleDirty && (
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSaveSchedule}
                                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Сохранить
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Last Care Dates */}
            <div className="mb-6">
                 <h2 className="text-lg font-semibold mb-3">Последний уход</h2>
                 <div className="space-y-2">
                     {careActions.filter(a => a.lastActionDate).map(({type, label, lastActionDate}) => (
                         <div key={type} className="flex justify-between text-sm p-3 bg-card rounded-lg border border-accent">
                             <span>{label}</span>
                             <span className="font-medium">{new Date(lastActionDate!).toLocaleDateString('ru-RU')}</span>
                         </div>
                     ))}
                 </div>
            </div>

            {/* Delete Button Section */}
            <div className="mt-8 border-t border-red-500/20 pt-6">
                <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="w-full flex items-center justify-center gap-2 text-center px-4 py-2.5 bg-red-500/10 text-red-500 rounded-lg font-semibold hover:bg-red-500/20 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                    Выкорчевать
                </button>
            </div>

            {/* Edit Modal/Form */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-card rounded-2xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Редактировать растение</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-accent -mr-2 -mt-2">
                                <CloseIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1">Название</label>
                                <input type="text" value={editablePlant.name} onChange={(e) => setEditablePlant({...editablePlant, name: e.target.value})} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-foreground/80 mb-1">Локация</label>
                               <select value={editablePlant.location} onChange={(e) => setEditablePlant({...editablePlant, location: e.target.value as PlantLocation})} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary capitalize">
                                   {PLANT_LOCATIONS_OPTIONS.map(loc => <option key={loc} value={loc}>{PLANT_LOCATION_RUSSIAN[loc]}</option>)}
                               </select>
                               {editablePlant.location === PlantLocation.OTHER && (
                                   <input 
                                       type="text" 
                                       value={editablePlant.customLocation || ''} 
                                       onChange={(e) => setEditablePlant({...editablePlant, customLocation: e.target.value})}
                                       placeholder="Укажите местоположение"
                                       required
                                       className="w-full bg-accent border-none rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-primary"
                                   />
                               )}
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-foreground/80 mb-1">Тип</label>
                               <select value={editablePlant.type} onChange={(e) => setEditablePlant({...editablePlant, type: e.target.value as PlantType})} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary capitalize">
                                   {PLANT_TYPES_OPTIONS.map(pt => <option key={pt} value={pt}>{PLANT_TYPE_RUSSIAN[pt]}</option>)}
                               </select>
                               {editablePlant.type === PlantType.OTHER && (
                                   <input 
                                       type="text" 
                                       value={editablePlant.customType || ''} 
                                       onChange={(e) => setEditablePlant({...editablePlant, customType: e.target.value})}
                                       placeholder="Укажите тип растения"
                                       required
                                       className="w-full bg-accent border-none rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-primary"
                                   />
                               )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors">Отмена</button>
                            <button onClick={handleSaveChanges} className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                                <SaveIcon className="w-4 h-4"/> Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsDeleteConfirmOpen(false)}>
                    <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in-up text-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-2">Подтвердите действие</h2>
                        <p className="text-foreground/80 mb-6">
                            Вы уверены, что хотите выкорчевать "{plant.name}"? Это действие необратимо.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setIsDeleteConfirmOpen(false)} 
                                className="px-6 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors"
                            >
                                Отмена
                            </button>
                            <button 
                                onClick={handleConfirmDelete} 
                                className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlantDetailScreen;