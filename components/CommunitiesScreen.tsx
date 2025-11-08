import React, { useState } from 'react';
import { Community } from '../types';
import { SearchIcon, PlusIcon } from './icons';
import CreateCommunityModal from './CreateCommunityModal';

interface CommunitiesScreenProps {
    communities: Community[];
    onJoin: (communityId: string) => void;
    onLeave: (communityId: string) => void;
    onCreate: (communityData: Omit<Community, 'id' | 'memberCount' | 'isMember'>) => void;
    onSelect: (community: Community) => void;
}

const CommunitiesScreen: React.FC<CommunitiesScreenProps> = ({ communities, onJoin, onLeave, onCreate, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [leavingCommunityId, setLeavingCommunityId] = useState<string | null>(null);

    const filteredCommunities = communities.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateCommunity = (communityData: Omit<Community, 'id' | 'memberCount' | 'isMember'>) => {
        onCreate(communityData);
        setIsCreateModalOpen(false);
    };

    const handleConfirmLeave = () => {
        if (leavingCommunityId) {
            onLeave(leavingCommunityId);
            setLeavingCommunityId(null);
        }
    };

    return (
        <>
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
                        <img src={community.photoUrl.replace('&w=800&h=400', '&w=200&h=200')} alt={community.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
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