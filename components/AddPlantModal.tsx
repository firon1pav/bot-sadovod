import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Plant, PlantLocation, PlantType } from '../types';
import { PLANT_LOCATIONS_OPTIONS, PLANT_TYPES_OPTIONS } from '../constants';
import { PLANT_LOCATION_RUSSIAN, PLANT_TYPE_RUSSIAN } from '../utils';
import { UploadIcon } from './icons';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (plant: Omit<Plant, 'id' | 'createdAt'>) => void;
}

const AddPlantModal: React.FC<AddPlantModalProps> = ({ isOpen, onClose, onAddPlant }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<PlantLocation>(PlantLocation.HOME);
  const [customLocation, setCustomLocation] = useState('');
  const [type, setType] = useState<PlantType>(PlantType.FOLIAGE);
  const [customType, setCustomType] = useState('');
  const [lastWateredAt, setLastWateredAt] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!isOpen) {
        setName('');
        setLocation(PlantLocation.HOME);
        setCustomLocation('');
        setType(PlantType.FOLIAGE);
        setCustomType('');
        setLastWateredAt(new Date().toISOString().split('T')[0]);
        setPhotoUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  }, [isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newPlant: Omit<Plant, 'id' | 'createdAt'> = {
      userId: 'user1',
      name,
      photoUrl: photoUrl || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/400/400`,
      location,
      customLocation: location === PlantLocation.OTHER ? customLocation : undefined,
      type,
      customType: type === PlantType.OTHER ? customType : undefined,
      lastWateredAt: new Date(lastWateredAt),
      wateringFrequencyDays: 0, // This will be set by the hook based on type
    };
    onAddPlant(newPlant);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Добавить новое растение</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col items-center">
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-full bg-accent flex items-center justify-center text-foreground/50 hover:bg-accent/80 transition-colors"
                >
                    {photoUrl ? (
                        <img src={photoUrl} alt="Превью" className="w-full h-full rounded-full object-cover"/>
                    ) : (
                        <div className="text-center">
                           <UploadIcon className="w-8 h-8 mx-auto" />
                           <span className="text-xs mt-1">Фото</span>
                        </div>
                    )}
                </button>
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
            <div>
              <label htmlFor="lastWatered" className="block text-sm font-medium text-foreground/80 mb-1">Последний полив</label>
              <input type="date" id="lastWatered" value={lastWateredAt} onChange={(e) => setLastWateredAt(e.target.value)} required className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors">Отмена</button>
            <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlantModal;