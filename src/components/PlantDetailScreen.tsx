
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plant, CareType, PlantLocation, PlantType } from '../types';
import { BackIcon, EditIcon, SaveIcon, CloseIcon, WaterDropIcon, ScissorsIcon, SpadeIcon, FertilizerIcon, UploadIcon, CalendarIcon, TrashIcon, StethoscopeIcon, ChatBubbleIcon, TagIcon } from './icons';
import { PLANT_LOCATION_RUSSIAN, PLANT_TYPE_RUSSIAN, compressImage } from '../utils';
import { PLANT_LOCATIONS_OPTIONS, PLANT_TYPES_OPTIONS } from '../constants';
import AiDoctorModal from './AiDoctorModal';
import AiChatModal from './AiChatModal';
import TimelapseModal from './TimelapseModal';

interface EditableSchedule {
    wateringFrequencyDays?: number;
    nextFertilizingDate?: string;
    nextRepottingDate?: string;
    nextTrimmingDate?: string;
}

interface PlantDetailScreenProps {
  plant: Plant;
  onBack: () => void;
  onUpdatePlant: (plantId: string, updatedData: any) => void;
  onLogCareEvent: (plantId: string, type: CareType) => void;
  onDeletePlant: (plantId: string) => void;
  onRefreshData?: () => void;
}

const PlantDetailScreen: React.FC<PlantDetailScreenProps> = ({ plant, onBack, onUpdatePlant, onLogCareEvent, onDeletePlant, onRefreshData }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDoctorOpen, setIsDoctorOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTimelapseOpen, setIsTimelapseOpen] = useState(false);
    
    const [editablePlant, setEditablePlant] = useState(plant);
    const [isCompressing, setIsCompressing] = useState(false);
    
    const initialSchedule = useMemo(() => ({
        wateringFrequencyDays: plant.wateringFrequencyDays,
        nextFertilizingDate: plant.nextFertilizingDate ? new Date(plant.nextFertilizingDate).toISOString().split('T')[0] : undefined,
        nextRepottingDate: plant.nextRepottingDate ? new Date(plant.nextRepottingDate).toISOString().split('T')[0] : undefined,
        nextTrimmingDate: plant.nextTrimmingDate ? new Date(plant.nextTrimmingDate).toISOString().split('T')[0] : undefined,
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const originalFile = e.target.files[0];
            setIsCompressing(true);
            
            try {
                const compressedFile = await compressImage(originalFile);
                const formData = new FormData();
                formData.append('photo', compressedFile);
                onUpdatePlant(plant.id, formData);
            } catch (err) {
                const formData = new FormData();
                formData.append('photo', originalFile);
                onUpdatePlant(plant.id, formData);
            } finally {
                setIsCompressing(false);
            }
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
        { type: CareType.WATER, Icon: WaterDropIcon, label: 'Полить', color: 'blue' },
        { type: CareType.FERTILIZE, Icon: FertilizerIcon, label: 'Удобрить', color: 'green' },
        { type: CareType.REPOT, Icon: SpadeIcon, label: 'Пересадить', color: 'green' },
        { type: CareType.TRIM, Icon: ScissorsIcon, label: 'Обрезать', color: 'green' },
    ], []);
    
    const colorClasses = {
        blue: { icon: 'text-blue-400', text: 'text-blue-400' },
        green: { icon: 'text-green-400', text: 'text-green-400' },
    };

    const scheduleItems = [
        { label: 'Полив', key: 'wateringFrequencyDays', type: 'number', placeholder: 'дней' },
        { label: 'Подкормка', key: 'nextFertilizingDate', type: 'date', placeholder: '' },
        { label: 'Пересадка', key: 'nextRepottingDate', type: 'date', placeholder: '' },
        { label: 'Обрезка', key: 'nextTrimmingDate', type: 'date', placeholder: '' },
    ] as const;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-accent -ml-2">
                    <BackIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-center truncate px-2">{plant.name}</h1>
                <button onClick={() => setIsEditModalOpen(true)} className="p-2 rounded-full hover:bg-accent -mr-2">
                    <EditIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="px-4 pb-4">
                {/* Photo */}
                <div className="relative mb-6">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*" />
                    <img src={plant.photoUrl} alt={plant.name} className={`w-full h-64 object-cover rounded-2xl ${isCompressing ? 'opacity-50' : ''}`} />
                    {isCompressing && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    {/* Market Badge */}
                    {plant.isForSale && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <TagIcon className="w-3 h-3" /> В продаже
                        </div>
                    )}

                    {/* Timelapse Button - Bottom Left */}
                    <button 
                        onClick={() => setIsTimelapseOpen(true)}
                        className="absolute bottom-3 left-3 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white p-2 pr-3 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold transition-all active:scale-95 border border-white/10"
                    >
                        <span>▶</span> Живой альбом
                    </button>

                    <button onClick={() => fileInputRef.current?.click()} disabled={isCompressing} className="absolute bottom-3 right-3 bg-card/80 text-card-foreground p-2 rounded-full shadow-lg hover:bg-card flex items-center gap-2 text-sm px-3 disabled:opacity-50 transition-all active:scale-95">
                        <UploadIcon className="w-4 h-4" />
                        Загрузить
                    </button>
                </div>

                {/* AI Tools */}
                <div className="flex gap-3 mb-6">
                    <button 
                        onClick={() => setIsDoctorOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 rounded-xl font-semibold hover:bg-red-500/20 transition-colors active:scale-95"
                    >
                        <StethoscopeIcon className="w-5 h-5" />
                        Доктор
                    </button>
                    <button 
                         onClick={() => setIsChatOpen(true)}
                         className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-colors active:scale-95"
                    >
                        <ChatBubbleIcon className="w-5 h-5" />
                        Чат с ботаником
                    </button>
                </div>
                
                {/* Log Care Actions */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Журнал ухода</h2>
                    <div className="grid grid-cols-4 gap-3 text-center">
                        {careActions.map(({ type, Icon, label, color }) => (
                            <button 
                                key={type} 
                                onClick={() => onLogCareEvent(plant.id, type)} 
                                className="flex flex-col items-center justify-center h-full p-3 bg-accent rounded-xl hover:bg-accent/70 transition-colors active:scale-95"
                            >
                                <Icon className={`w-7 h-7 mb-2 ${colorClasses[color as keyof typeof colorClasses].icon}`} />
                                <span className={`text-sm font-semibold ${colorClasses[color as keyof typeof colorClasses].text}`}>{label}</span>
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
                         {careActions.filter(a => {
                            switch(a.type) {
                                case CareType.WATER: return plant.lastWateredAt;
                                case CareType.FERTILIZE: return plant.lastFertilizedAt;
                                case CareType.REPOT: return plant.lastRepottedAt;
                                case CareType.TRIM: return plant.lastTrimmedAt;
                                default: return false;
                            }
                         }).map(({type, label}) => {
                             let lastActionDate;
                             switch(type) {
                                case CareType.WATER: lastActionDate = plant.lastWateredAt; break;
                                case CareType.FERTILIZE: lastActionDate = plant.lastFertilizedAt; break;
                                case CareType.REPOT: lastActionDate = plant.lastRepottedAt; break;
                                case CareType.TRIM: lastActionDate = plant.lastTrimmedAt; break;
                             }
                             return (
                                 <div key={type} className="flex justify-between text-sm p-3 bg-card rounded-lg border border-accent">
                                     <span>{label}</span>
                                     <span className="font-medium">{new Date(lastActionDate!).toLocaleDateString('ru-RU')}</span>
                                 </div>
                             )
                         })}
                     </div>
                </div>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
                        <div className="bg-card rounded-2xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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

                                {/* Market Settings */}
                                <div className="border-t border-accent pt-4 mt-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={editablePlant.isForSale || false} 
                                            onChange={(e) => setEditablePlant({...editablePlant, isForSale: e.target.checked})}
                                            className="w-5 h-5 rounded border-accent text-primary focus:ring-primary"
                                        />
                                        <span className="font-bold flex items-center gap-2">
                                            <TagIcon className="w-4 h-4 text-primary" />
                                            Выставить на продажу/обмен
                                        </span>
                                    </label>

                                    {editablePlant.isForSale && (
                                        <div className="mt-4 space-y-3 animate-fade-in pl-2 border-l-2 border-primary/20">
                                            <div>
                                                <label className="block text-xs font-medium text-foreground/60 mb-1">Цена (0 = Даром)</label>
                                                <input 
                                                    type="number" 
                                                    value={editablePlant.price || ''} 
                                                    onChange={(e) => setEditablePlant({...editablePlant, price: parseInt(e.target.value) || 0})}
                                                    placeholder="0"
                                                    className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-foreground/60 mb-1">Город</label>
                                                <input 
                                                    type="text" 
                                                    value={editablePlant.city || ''} 
                                                    onChange={(e) => setEditablePlant({...editablePlant, city: e.target.value})}
                                                    placeholder="Москва"
                                                    className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-foreground/60 mb-1">Описание для объявления</label>
                                                <textarea 
                                                    value={editablePlant.description || ''} 
                                                    onChange={(e) => setEditablePlant({...editablePlant, description: e.target.value})}
                                                    rows={3}
                                                    placeholder="Расскажите о состоянии..."
                                                    className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary no-scrollbar"
                                                />
                                            </div>
                                        </div>
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
            </div>

            {/* AI Modals */}
            {isDoctorOpen && (
                <AiDoctorModal 
                    plant={plant} 
                    onClose={() => setIsDoctorOpen(false)} 
                    onAiActionSuccess={onRefreshData}
                />
            )}
            {isChatOpen && (
                <AiChatModal 
                    plant={plant} 
                    onClose={() => setIsChatOpen(false)} 
                    onAiActionSuccess={onRefreshData}
                />
            )}
            {isTimelapseOpen && (
                <TimelapseModal plantId={plant.id} onClose={() => setIsTimelapseOpen(false)} />
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
