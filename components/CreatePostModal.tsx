import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { User } from '../types';
import { CloseIcon, UploadIcon, SaveIcon } from './icons';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { text: string; photoUrl?: string }) => void;
  currentUser: User;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreate, currentUser }) => {
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setText('');
      setPhotoUrl(null);
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
  
  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onCreate({ text, photoUrl: photoUrl || undefined });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Новый пост</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent -mr-2 -mt-2">
            <CloseIcon className="w-5 h-5"/>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
                <img src={currentUser.photoUrl} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                <p className="font-bold">{currentUser.name}</p>
            </div>
            <div>
              <textarea
                placeholder="Что у вас нового?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={4}
                className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary no-scrollbar"
                autoFocus
              />
            </div>
            <div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
              {photoUrl ? (
                <div className="relative group">
                  <img src={photoUrl} alt="Превью" className="w-full h-48 object-cover rounded-lg" />
                   <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30">
                        <UploadIcon className="w-6 h-6" />
                    </button>
                    <button type="button" onClick={handleRemovePhoto} className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-accent rounded-lg flex flex-col items-center justify-center text-foreground/50 hover:bg-accent transition-colors"
                >
                  <UploadIcon className="w-8 h-8" />
                  <span className="text-sm mt-2">Добавить фото</span>
                </button>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors">Отмена</button>
            <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50" disabled={!text.trim()}>
              <SaveIcon className="w-4 h-4"/> Опубликовать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
