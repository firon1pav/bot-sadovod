
import React, { useState, useEffect } from 'react';
import { Community, Plant } from '../types';
import { SearchIcon, PlusIcon } from './icons';
import CreateCommunityModal from './CreateCommunityModal';
import { api } from '../services/api';

interface CommunitiesScreenProps {
    communities: Community[];
    onJoin: (communityId: string) => void;
    onLeave: (communityId: string) => void;
    onCreate: (communityData: any) => void;
    onSelect: (community: Community) => void;
}

const CommunitiesScreen: React.FC<CommunitiesScreenProps> = ({ communities, onJoin, onLeave, onCreate, onSelect }) => {
    const [activeTab, setActiveTab] = useState<'groups' | 'market'>('groups');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [leavingCommunityId, setLeavingCommunityId] = useState<string | null>(null);
    const [marketItems, setMarketItems] = useState<Plant[]>([]);
    const [isLoadingMarket, setIsLoadingMarket] = useState(false);

    const filteredCommunities = communities.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateCommunity = (communityData: any) => {
        onCreate(communityData);
        setIsCreateModalOpen(false);
    };

    const handleConfirmLeave = () => {
        if (leavingCommunityId) {
            onLeave(leavingCommunityId);
            setLeavingCommunityId(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'market') {
            setIsLoadingMarket(true);
            api.getMarket().then(setMarketItems).catch(console.error).finally(() => setIsLoadingMarket(false));
        }
    }, [activeTab]);

    return (
        <>
            <div className="flex gap-2 mb-4 p-1 bg-accent/20 rounded-lg">
                <button 
                    onClick={() => setActiveTab('groups')} 
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'groups' ? 'bg-card shadow-sm text-primary' : 'text-foreground/60'}`}
                >
                    Клубы
                </button>
                <button 
                    onClick={() => setActiveTab('market')} 
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'market' ? 'bg-card shadow-sm text-primary' : 'text-foreground/60'}`}
                >
                    Обмен 🌿
                </button>
            </div>

            {activeTab === 'groups' && (
                <div className="animate-fade-in space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Найти сообщество..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-card border border-accent rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 shadow-sm hover:bg-primary/90 transition-colors"
                            title="Создать сообщество"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {filteredCommunities.map(community => (
                        <div 
                            key={community.id}
                            onClick={() => onSelect(community)}
                            className="bg-card border border-accent p-4 rounded-lg flex items-start gap-4 hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                            <img src={community.photoUrl} alt={community.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-grow">
                                <h4 className="font-bold">{community.name}</h4>
                                <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{community.description}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-foreground/60">
                                        <span>👥</span>
                                        <span>{community.memberCount.toLocaleString('ru-RU')}</span>
                                    </div>
                                    {community.isMember ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setLeavingCommunityId(community.id); }}
                                            className="text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-1 rounded-full hover:bg-red-500/20"
                                        >
                                            Выйти
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onJoin(community.id); }}
                                            className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20"
                                        >
                                            Вступить
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'market' && (
                <div className="animate-fade-in">
                    {isLoadingMarket ? (
                        <div className="text-center py-10">Загрузка растений...</div>
                    ) : marketItems.length === 0 ? (
                        <div className="text-center py-10 text-foreground/60">Никто пока ничего не меняет. Будьте первым!</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {marketItems.map(plant => (
                                <div key={plant.id} className="bg-card border border-accent rounded-xl overflow-hidden">
                                    <div className="h-32 relative">
                                        <img src={plant.photoUrl} className="w-full h-full object-cover" alt={plant.name} />
                                        <div className="absolute top-2 right-2">
                                            {plant.isGiveaway ? (
                                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">Даром</span>
                                            ) : (
                                                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">Обмен</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm truncate">{plant.name}</h4>
                                        <p className="text-xs text-foreground/60">{plant.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <CreateCommunityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateCommunity}
            />
            {leavingCommunityId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLeavingCommunityId(null)}>
                    <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in-up text-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-2">Покинуть сообщество?</h2>
                        <p className="text-foreground/80 mb-6">
                            Вы уверены, что хотите покинуть это сообщество?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setLeavingCommunityId(null)} 
                                className="px-6 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-colors"
                            >
                                Отмена
                            </button>
                            <button 
                                onClick={handleConfirmLeave} 
                                className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                            >
                                Покинуть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommunitiesScreen;
