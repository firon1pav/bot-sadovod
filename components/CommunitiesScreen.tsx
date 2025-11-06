import React, { useState } from 'react';
import { Community } from '../types';
import { SearchIcon, UsersIcon } from './icons';

interface CommunitiesScreenProps {
    communities: Community[];
    onJoin: (communityId: string) => void;
    onLeave: (communityId: string) => void;
}

const CommunitiesScreen: React.FC<CommunitiesScreenProps> = ({ communities, onJoin, onLeave }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCommunities = communities.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Найти сообщество..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card border border-accent rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
            </div>

            {filteredCommunities.map(community => (
                <div key={community.id} className="bg-card border border-accent p-4 rounded-lg flex items-start gap-4">
                    <img src={community.photoUrl} alt={community.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-grow">
                        <h4 className="font-bold">{community.name}</h4>
                        <p className="text-xs text-foreground/70 mt-1">{community.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-foreground/60">
                                <UsersIcon className="w-3.5 h-3.5" />
                                <span>{community.memberCount.toLocaleString('ru-RU')}</span>
                            </div>
                            {community.isMember ? (
                                <button
                                    onClick={() => onLeave(community.id)}
                                    className="text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-1 rounded-full hover:bg-red-500/20"
                                >
                                    Выйти
                                </button>
                            ) : (
                                <button
                                    onClick={() => onJoin(community.id)}
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
    );
};

export default CommunitiesScreen;
