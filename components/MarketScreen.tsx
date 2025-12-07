
import React, { useState } from 'react';
import { Plant, User } from '../types';
import { SearchIcon, PlusIcon, LocationIcon } from './icons';
import AddMarketItemModal from './AddMarketItemModal';
import MarketItemDetailModal from './MarketItemDetailModal';

interface MarketScreenProps {
    items: Plant[];
    onAddItem: (itemData: any) => void;
    user: User;
}

const MarketScreen: React.FC<MarketScreenProps> = ({ items, onAddItem, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Plant | null>(null);

    const filteredItems = items.filter(item => {
        // Tab Filter
        // 'all': Show items NOT owned by current user (market items from others)
        if (activeTab === 'all' && item.userId === user.id) return false;
        // 'my': Show items owned ONLY by current user
        if (activeTab === 'my' && item.userId !== user.id) return false;

        // Search Filters
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCity = cityFilter ? item.city?.toLowerCase().includes(cityFilter.toLowerCase()) : true;
        
        return matchesSearch && matchesCity;
    });

    return (
        <div className="animate-fade-in p-4 pb-24">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Зеленый Рынок</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 p-1 bg-accent/20 rounded-lg">
                <button 
                    onClick={() => setActiveTab('all')} 
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'all' ? 'bg-card shadow-sm text-primary' : 'text-foreground/60'}`}
                >
                    Все предложения
                </button>
                <button 
                    onClick={() => setActiveTab('my')} 
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'my' ? 'bg-card shadow-sm text-primary' : 'text-foreground/60'}`}
                >
                    Мои объявления
                </button>
            </div>

            {/* Filters */}
            <div className="space-y-3 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Найти растение..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-accent rounded-full pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary shadow-sm"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Фильтр по городу"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="w-full bg-card border border-accent rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                        <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-16 opacity-60">
                    <div className="text-4xl mb-2">🍃</div>
                    <p>{activeTab === 'my' ? 'У вас пока нет объявлений.' : 'Объявлений пока нет.'}</p>
                    <p className="text-sm text-foreground/60 mt-1">{activeTab === 'my' ? 'Нажмите +, чтобы добавить.' : 'Станьте первым продавцом!'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedItem(item)}
                            className="bg-card border border-accent rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
                        >
                            <div className="h-40 relative">
                                <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2">
                                    {item.price === 0 ? (
                                        <span className="bg-green-500/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                            Даром
                                        </span>
                                    ) : (
                                        <span className="bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                            {item.price} {item.currency || '₽'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-sm truncate mb-1">{item.name}</h3>
                                <div className="flex items-center justify-between text-xs text-foreground/60">
                                    <span className="truncate max-w-[80px]">{item.city || 'Город?'}</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FAB */}
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-4 shadow-xl hover:scale-110 transition-transform z-40 flex items-center justify-center"
            >
                <PlusIcon className="w-6 h-6" />
            </button>

            <AddMarketItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddItem={onAddItem}
            />

            {selectedItem && (
                <MarketItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
};

export default MarketScreen;
