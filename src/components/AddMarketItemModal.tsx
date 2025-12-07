
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { PlantType } from '../types';
import { PLANT_TYPES_OPTIONS } from '../constants';
import { PLANT_TYPE_RUSSIAN, compressImage } from '../utils';
import { UploadIcon, CloseIcon, TagIcon } from './icons';

interface AddMarketItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (formData: any) => void;
}

const AddMarketItemModal: React.FC<AddMarketItemModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PlantType>(PlantType.FOLIAGE);
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
        setName('');
        setType(PlantType.FOLIAGE);
        setPrice('');
        setCity('');
        setDescription('');
        setPhotoUrl(null);
        setPhotoFile(null);
        setIsCompressing(false);
        setIsSubmitting(false);
    }
  }, [isOpen]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      setIsCompressing(true);
      try {
          const compressedFile = await compressImage(originalFile);
          setPhotoFile(compressedFile);
          setPhotoUrl(URL.createObjectURL(compressedFile));
      } catch (err) {
          console.error("Compression Error", err);
          setPhotoFile(originalFile);
          setPhotoUrl(URL.createObjectURL(originalFile));
      } finally {
          setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isCompressing) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('price', price || '0');
    formData.append('city', city);
    formData.append('description', description);
    formData.append('isForSale', 'true');
    formData.append('wateringFrequencyDays', '7'); // Default dummy value for backend validation
    
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    onAddItem(formData);
    onClose();
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Новое объявление</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-accent -mr-2 -mt-2">
                <CloseIcon className="w-5 h-5"/>
            </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col items-center">
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="relative w-full h-40 bg-accent rounded-xl flex flex-col items-center justify-center text-foreground/50 hover:bg-accent/80 transition-colors disabled:opacity-50 border-2 border-dashed border-primary/20"
                >
                    {isCompressing ? (
                        <div className="w-6 h-6 border-2 border-foreground/50 border-t-transparent rounded-full animate-spin"></div>
                    ) : photoUrl ? (
                        <img src={photoUrl} alt="Превью" className="w-full h-full rounded-xl object-cover"/>
                    ) : (
                        <>
                           <UploadIcon className="w-8 h-8 mb-2" />
                           <span className="text-sm">Загрузить фото</span>
                        </>
                    )}
                </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Название</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Цена (₽)</label>
                    <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        placeholder="0 = Даром"
                        className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Город</label>
                    <input 
                        type="text" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        required 
                        placeholder="Москва"
                        className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Тип растения</label>
              <select value={type} onChange={(e) => setType(e.target.value as PlantType)} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary capitalize">
                {PLANT_TYPES_OPTIONS.map(pt => <option key={pt} value={pt}>{PLANT_TYPE_RUSSIAN[pt]}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Описание</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
                rows={3} 
                placeholder="Расскажите о состоянии растения..."
                className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary no-scrollbar"
              />
            </div>
          </div>

          <div className="mt-6">
            <button type="submit" disabled={isSubmitting || isCompressing} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                <TagIcon className="w-5 h-5" />
                {isSubmitting ? 'Публикация...' : 'Разместить объявление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarketItemModal;
