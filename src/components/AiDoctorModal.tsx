
import React, { useState, useRef } from 'react';
import { Plant } from '../types';
import { CloseIcon, StethoscopeIcon, UploadIcon, LockIcon } from './icons';
import { diagnosePlant } from '../services/ai';
import { compressImage } from '../utils';
import { useNavigate } from 'react-router-dom';

interface AiDoctorModalProps {
    plant: Plant;
    onClose: () => void;
    onAiActionSuccess?: () => void;
}

const AiDoctorModal: React.FC<AiDoctorModalProps> = ({ plant, onClose, onAiActionSuccess }) => {
    const [diagnosis, setDiagnosis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    // Photo state
    const [previewUrl, setPreviewUrl] = useState<string>(plant.photoUrl);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                // Compress to save traffic
                const compressed = await compressImage(file);
                setPhotoFile(compressed);
                setPreviewUrl(URL.createObjectURL(compressed));
                setDiagnosis(null); // Reset previous diagnosis
                setError(null);
            } catch (err) {
                console.error("Error processing image", err);
                setPhotoFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleDiagnose = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Use the uploaded file if available, otherwise the existing plant photo URL
            const imageToAnalyze = photoFile || previewUrl;
            const result = await diagnosePlant(imageToAnalyze);
            setDiagnosis(result);
            if (onAiActionSuccess) {
                onAiActionSuccess();
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "";
            if (msg.includes("Limit")) {
                setError("LIMIT_REACHED");
            } else {
                setError(msg || "Не удалось провести диагностику. Проверьте соединение или фото.");
            }
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

                <div className="flex-grow overflow-y-auto mb-4 custom-scrollbar">
                    
                    {/* Photo Section */}
                    <div className="mb-6">
                        <div className="relative h-56 w-full rounded-xl overflow-hidden bg-accent/30 border border-accent mb-3">
                            <img src={previewUrl} alt="Diagnosis Target" className="w-full h-full object-cover" />
                            {/* Overlay Badge if new photo selected */}
                            {photoFile && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                    Новое фото
                                </div>
                            )}
                        </div>
                        
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2 bg-accent hover:bg-accent/80 text-foreground border border-accent rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                        >
                            <UploadIcon className="w-4 h-4" />
                            {photoFile ? "Выбрать другое фото" : "Загрузить фото проблемы"}
                        </button>
                        
                        <p className="text-xs text-center text-foreground/50 mt-2">
                            Загрузите фото больного листа или пятна крупным планом для лучшего результата.
                        </p>
                    </div>

                    {!diagnosis && !isLoading && !error && (
                        <div className="text-center py-2">
                            <button
                                onClick={handleDiagnose}
                                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <StethoscopeIcon className="w-5 h-5" />
                                Начать диагностику
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-accent rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                <StethoscopeIcon className="absolute inset-0 m-auto w-6 h-6 text-red-500 animate-pulse" />
                            </div>
                            <p className="mt-4 font-medium animate-pulse">Изучаю симптомы...</p>
                            <p className="text-xs text-foreground/50">Это может занять до 10-15 секунд</p>
                        </div>
                    )}

                    {error === "LIMIT_REACHED" && (
                        <div className="text-center py-6 bg-card border border-yellow-500/30 rounded-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-yellow-500/5 z-0"></div>
                            <div className="relative z-10">
                                <LockIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                                <h3 className="font-bold text-lg mb-2">Лимит запросов (5/5)</h3>
                                <p className="text-sm text-foreground/70 mb-4 px-4">
                                    Вы использовали все бесплатные запросы в этом месяце. Лимит обновится 1-го числа.
                                </p>
                            </div>
                        </div>
                    )}

                    {error && error !== "LIMIT_REACHED" && (
                        <div className="text-center text-red-500 py-4 bg-red-500/10 rounded-lg border border-red-500/20">
                            <p className="font-bold mb-1">Ошибка</p>
                            {error}
                        </div>
                    )}

                    {diagnosis && (
                        <div className="animate-fade-in-up">
                            <div className="bg-accent/20 p-4 rounded-xl border border-accent">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-primary">
                                    <span className="text-xl">📋</span> Заключение:
                                </h3>
                                <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
                                    {diagnosis}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <button 
                                    onClick={() => { setDiagnosis(null); }}
                                    className="text-sm text-foreground/60 hover:text-primary underline"
                                >
                                    Попробовать еще раз
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiDoctorModal;
