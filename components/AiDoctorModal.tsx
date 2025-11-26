

import React, { useState } from 'react';
import { Plant } from '../types';
import { CloseIcon, StethoscopeIcon } from './icons';
import { diagnosePlant } from '../services/ai';

interface AiDoctorModalProps {
    plant: Plant;
    onClose: () => void;
}

const AiDoctorModal: React.FC<AiDoctorModalProps> = ({ plant, onClose }) => {
    const [diagnosis, setDiagnosis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDiagnose = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await diagnosePlant(plant.photoUrl);
            setDiagnosis(result);
        } catch (err) {
            console.error(err);
            setError("Не удалось провести диагностику. Проверьте соединение или фото.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card rounded-2xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <StethoscopeIcon className="w-6 h-6 text-red-500" />
                        Доктор Растений
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-accent -mr-2 -mt-2">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto mb-4">
                    <div className="flex items-center gap-4 mb-4 bg-accent/30 p-3 rounded-lg">
                        <img src={plant.photoUrl} alt={plant.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                            <p className="font-bold">{plant.name}</p>
                            <p className="text-xs text-foreground/60">AI проанализирует это фото</p>
                        </div>
                    </div>

                    {!diagnosis && !isLoading && !error && (
                        <div className="text-center py-6">
                            <p className="text-foreground/80 mb-4">
                                Нажмите кнопку ниже, чтобы проанализировать состояние растения на фото.
                                Я поищу признаки болезней, вредителей или ошибок в уходе.
                            </p>
                            <button
                                onClick={handleDiagnose}
                                className="px-6 py-3 bg-red-500 text-white rounded-full font-bold shadow-lg hover:bg-red-600 transition-transform active:scale-95"
                            >
                                Провести диагностику
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="animate-pulse">Изучаю листики...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-500 py-4 bg-red-500/10 rounded-lg">
                            {error}
                        </div>
                    )}

                    {diagnosis && (
                        <div className="bg-accent/20 p-4 rounded-lg border border-accent">
                            <h3 className="font-bold text-lg mb-2">Заключение:</h3>
                            <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
                                {diagnosis}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiDoctorModal;