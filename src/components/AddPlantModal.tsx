
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Plant, PlantLocation, PlantType } from '../types';
import { PLANT_LOCATIONS_OPTIONS, PLANT_TYPES_OPTIONS } from '../constants';
import { PLANT_LOCATION_RUSSIAN, PLANT_TYPE_RUSSIAN, compressImage, getTodayString } from '../utils';
import { UploadIcon, SparklesIcon, LockIcon } from './icons';
import { identifyPlant } from '../services/ai';
import { useNavigate } from 'react-router-dom';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Handler expects FormData to pass to hook -> API
  onAddPlant: (plantFormData: any) => void; 
  onAiActionSuccess?: () => void;
}

const AddPlantModal: React.FC<AddPlantModalProps> = ({ isOpen, onClose, onAddPlant, onAiActionSuccess }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<PlantLocation>(PlantLocation.HOME);
  const [customLocation, setCustomLocation] = useState('');
  const [type, setType] = useState<PlantType>(PlantType.FOLIAGE);
  const [customType, setCustomType] = useState('');
  const [lastWateredAt, setLastWateredAt] = useState(getTodayString());
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [wateringFrequency, setWateringFrequency] = useState<number | string>('');
  
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
        setName('');
        setLocation(PlantLocation.HOME);
        setCustomLocation('');
        setType(PlantType.FOLIAGE);
        setCustomType('');
        setLastWateredAt(getTodayString());
        setPhotoUrl(null);
        setPhotoFile(null);
        setWateringFrequency('');
        setIsIdentifying(false);
        setAiError(null);
        setIsSubmitting(false);
        setIsCompressing(false);
        setLimitReached(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  }, [isOpen]);

  // Memory Leak Fix: Revoke Object URL when component unmounts or photoUrl changes
  useEffect(() => {
      return () => {
          if (photoUrl && photoUrl.startsWith('blob:')) {
              URL.revokeObjectURL(photoUrl);
          }
      };
  }, [photoUrl]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      
      setIsCompressing(true);
      try {
          const compressedFile = await compressImage(originalFile);
          setPhotoFile(compressedFile);
          
          // Cleanup old blob if it exists before setting new one
          if (photoUrl && photoUrl.startsWith('blob:')) {
              URL.revokeObjectURL(photoUrl);
          }
          
          setPhotoUrl(URL.createObjectURL(compressedFile));
          setAiError(null);
          setLimitReached(false);
      } catch (err) {
          console.error("Compression Error", err);
          setPhotoFile(originalFile);
          
          if (photoUrl && photoUrl.startsWith('blob:')) {
              URL.revokeObjectURL(photoUrl);
          }
          setPhotoUrl(URL.createObjectURL(originalFile));
      } finally {
          setIsCompressing(false);
      }
    }
  };

  const handleIdentify = async () => {
      if (!photoFile && !photoUrl) return;
      
      setIsIdentifying(true);
      setAiError(null);
      setLimitReached(false);
      
      try {
          // Pass the file if available, otherwise the URL (which createFormData will fetch)
          const result = await identifyPlant(photoFile || photoUrl!);
          
          if (result.name) setName(result.name);
          
          if (result.type) {
              const upperType = result.type.toUpperCase();
              if (Object.values(PlantType).includes(upperType as PlantType)) {
                  setType(upperType as PlantType);
              } else {
                  setType(PlantType.OTHER);
                  setCustomType(result.type);
              }
          }
          
          if (result.wateringFrequencyDays) {
              setWateringFrequency(result.wateringFrequencyDays);
          }

          if (onAiActionSuccess) {
              onAiActionSuccess();
          }

      } catch (error: any) {
          console.error("AI Identification failed", error);
          const msg = error.message || "";
          if (msg.includes("Limit")) {
              setLimitReached(true);
          } else {
              setAiError(msg || "Не удалось определить растение.");
          }
      } finally {
          setIsIdentifying(false);
      }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isCompressing) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    if (customLocation) formData.append('customLocation', customLocation);
    formData.append('type', type);
    if (customType) formData.append('customType', customType);
    formData.append('lastWateredAt', new Date(lastWateredAt).toISOString());
    
    const freq = Number(wateringFrequency);
    formData.append('wateringFrequencyDays', (freq > 0 ? freq : 7).toString());
    
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    // Call Hook directly with FormData. Hook will call API.
    onAddPlant(formData);
    onClose();
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Добавить новое растение</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="relative w-24 h-24 rounded-full bg-accent flex items-center justify-center text-foreground/50 hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                    {isCompressing ? (
                        <div className="w-6 h-6 border-2 border-foreground/50 border-t-transparent rounded-full animate-spin"></div>
                    ) : photoUrl ? (
                        <img src={photoUrl} alt="Превью" className="w-full h-full rounded-full object-cover"/>
                    ) : (
                        <div className="text-center">
                           <UploadIcon className="w-8 h-8 mx-auto" />
                           <span className="text-xs mt-1">Фото</span>
                        </div>
                    )}
                </button>
                {(photoUrl || photoFile) && !isIdentifying && !isCompressing && !limitReached && (
                    <button
                        type="button"
                        onClick={handleIdentify}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        Определить по фото (AI)
                    </button>
                )}
                 {isIdentifying && (
                     <div className="text-xs text-primary animate-pulse">Изучаю растение...</div>
                 )}
                 {limitReached && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full text-xs font-bold">
                         <LockIcon className="w-3 h-3" />
                         Лимит AI (5/5) исчерпан
                     </div>
                 )}
                 {aiError && (
                     <div className="text-xs text-red-500 text-center">{aiError}</div>
                 )}
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-1">Название растения</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground/80 mb-1">Местоположение</label>
              <select id="location" value={location} onChange={(e) => setLocation(e.target.value as PlantLocation)} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary capitalize">
                {PLANT_LOCATIONS_OPTIONS.map(loc => <option key={loc} value={loc}>{PLANT_LOCATION_RUSSIAN[loc]}</option>)}
              </select>
              {location === PlantLocation.OTHER && (
                  <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder="Укажите местоположение" required className="mt-2 w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
              )}
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-foreground/80 mb-1">Тип растения</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as PlantType)} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary capitalize">
                {PLANT_TYPES_OPTIONS.map(pt => <option key={pt} value={pt}>{PLANT_TYPE_RUSSIAN[pt]}</option>)}
              </select>
              {type === PlantType.OTHER && (
                  <input type="text" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Укажите тип растения" required className="mt-2 w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
              )}
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="lastWatered" className="block text-sm font-medium text-foreground/80 mb-1">Последний полив</label>
                    <input type="date" id="lastWatered" value={lastWateredAt} onChange={(e) => setLastWateredAt(e.target.value)} required className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
                </div>
                <div className="flex-1">
                    <label htmlFor="frequency" className="block text-sm font-medium text-foreground/80 mb-1">Полив (дней)</label>
                    <input 
                        type="number" 
                        id="frequency" 
                        value={wateringFrequency} 
                        onChange={(e) => setWateringFrequency(e.target.value)} 
                        placeholder="7" 
                        min="1"
                        className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors">Отмена</button>
            <button type="submit" disabled={isSubmitting || isCompressing} className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Сохранение...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlantModal;
