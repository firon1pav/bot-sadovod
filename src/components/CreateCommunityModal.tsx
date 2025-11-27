import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { CloseIcon, UploadIcon, UsersIcon } from './icons';
import { compressImage } from '../utils';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Handler now expects FormData
  onCreate: (communityData: any) => void; 
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
        setName('');
        setDescription('');
        setPhotoUrl(null);
        setPhotoFile(null);
        setIsCompressing(false);
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
          console.error("Compression failed", err);
          setPhotoFile(originalFile);
          setPhotoUrl(URL.createObjectURL(originalFile));
      } finally {
          setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || isCompressing) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    onCreate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Создать сообщество</h2>
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
            </div>
            <div>
              <label htmlFor="comm-name" className="block text-sm font-medium text-foreground/80 mb-1">Название</label>
              <input type="text" id="comm-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"/>
            </div>
            <div>
              <label htmlFor="comm-desc" className="block text-sm font-medium text-foreground/80 mb-1">Описание</label>
              <textarea id="comm-desc" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary no-scrollbar"/>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors">Отмена</button>
            <button type="submit" disabled={isCompressing} className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                <UsersIcon className="w-4 h-4" /> Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;