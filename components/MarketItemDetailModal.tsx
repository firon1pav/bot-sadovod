
import React from 'react';
import { Plant } from '../types';
import { CloseIcon, PaperAirplaneIcon, LocationIcon } from './icons';

interface MarketItemDetailModalProps {
    item: Plant;
    onClose: () => void;
}

const MarketItemDetailModal: React.FC<MarketItemDetailModalProps> = ({ item, onClose }) => {
    const handleContactSeller = () => {
        if (item.sellerTelegram) {
            // Remove @ if present
            const username = item.sellerTelegram.replace('@', '');
            const message = encodeURIComponent(`Привет! Я по поводу объявления "${item.name}" в BotGardener.`);
            window.open(`https://t.me/${username}?text=${message}`, '_blank');
        } else {
            alert('У продавца не указан Telegram username.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card rounded-2xl w-full max-w-sm overflow-hidden animate-fade-in-up shadow-2xl border border-accent" onClick={e => e.stopPropagation()}>
                
                {/* Image Header */}
                <div className="relative h-64">
                    <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-4">
                        {item.price === 0 ? (
                            <span className="bg-green-500 text-white font-bold px-3 py-1 rounded-full shadow-lg">Даром</span>
                        ) : (
                            <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full shadow-lg">
                                {item.price} {item.currency || '₽'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h2 className="text-2xl font-bold mb-1">{item.name}</h2>
                    <div className="flex items-center text-foreground/60 text-sm mb-4">
                        <LocationIcon className="w-4 h-4 mr-1" />
                        {item.city || 'Город не указан'}
                    </div>

                    <div className="bg-accent/20 p-3 rounded-xl mb-6">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {item.description || 'Нет описания.'}
                        </p>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center justify-between mb-6 pt-4 border-t border-accent/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                {item.sellerName ? item.sellerName[0].toUpperCase() : '?'}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{item.sellerName || 'Продавец'}</p>
                                <p className="text-xs text-foreground/50">В BotGardener</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleContactSeller}
                        className="w-full py-3 bg-[#24A1DE] hover:bg-[#208bbf] text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        Написать в Telegram
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketItemDetailModal;
