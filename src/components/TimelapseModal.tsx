
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CloseIcon } from './icons';

interface TimelapseModalProps {
    plantId: string;
    onClose: () => void;
}

const TimelapseModal: React.FC<TimelapseModalProps> = ({ plantId, onClose }) => {
    const [images, setImages] = useState<{ url: string; date: Date }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const data = await api.getTimelapse(plantId);
                setImages(data.map(d => ({ ...d, date: new Date(d.date) })));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchImages();
    }, [plantId]);

    useEffect(() => {
        let interval: any;
        if (isPlaying && images.length > 1) {
            interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % images.length);
            }, 800); // 800ms per frame
        }
        return () => clearInterval(interval);
    }, [isPlaying, images.length]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-card p-6 rounded-xl text-center">
                    <p>Нет дополнительных фото для создания истории.</p>
                    <p className="text-sm text-foreground/50 mt-2">Загружайте фото при поливе, чтобы увидеть прогресс!</p>
                    <button onClick={onClose} className="mt-4 text-primary font-bold">Закрыть</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-md aspect-square px-4" onClick={e => e.stopPropagation()}>
                <img 
                    src={images[currentIndex].url} 
                    alt="Growth" 
                    className="w-full h-full object-cover rounded-lg shadow-2xl border border-white/20"
                />
                <div className="absolute top-4 left-6 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono">
                    {images[currentIndex].date.toLocaleDateString()}
                </div>
            </div>

            <div className="mt-8 flex gap-6" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-8 py-3 bg-white text-black rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    {isPlaying ? "Пауза" : "Воспроизвести"}
                </button>
            </div>
            
            <div className="mt-4 text-white/50 text-sm">
                Кадр {currentIndex + 1} из {images.length}
            </div>
        </div>
    );
};

export default TimelapseModal;
