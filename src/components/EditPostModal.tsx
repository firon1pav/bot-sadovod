import React, { useState, FormEvent, useRef } from 'react';
import { CommunityPost } from '../types';
import { CloseIcon, UploadIcon, SaveIcon } from './icons';
import { compressImage } from '../utils';

interface EditPostModalProps {
  post: CommunityPost;
  onClose: () => void;
  onSave: (postId: string, data: any) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
  const [text, setText] = useState(post.text);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(post.photoUrl || undefined);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
    setPhotoFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isCompressing) return;
    
    const formData = new FormData();
    formData.append('text', text);
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    
    onSave(post.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Редактировать пост</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent -mr-2 -mt-2">
            <CloseIcon className="w-5 h-5"/>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="post-text" className="block text-sm font-medium text-foreground/80 mb-1">Текст поста</label>
              <textarea
                id="post-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={4}
                className="w-full bg-accent border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary no-scrollbar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Фото</label>
              <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
              {isCompressing ? (
                  <div className="w-full h-48 border-2 border-dashed border-accent rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
              ) : photoUrl ? (
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
                  className="w-full h-32 border-2 border-dashed border-accent rounded-lg flex flex-col items-center justify-center text-foreground/50 hover:bg-accent transition-colors"
                >
                  <UploadIcon className="w-8 h-8" />
                  <span className="text-sm mt-2">Загрузить фото</span>
                </button>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors">Отмена</button>
            <button type="submit" disabled={isCompressing} className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50">
              <SaveIcon className="w-4 h-4"/> Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;