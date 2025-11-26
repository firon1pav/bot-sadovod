

import React, { useState, useRef, useEffect } from 'react';
import { Plant } from '../types';
import { CloseIcon, ChatBubbleIcon, SparklesIcon } from './icons';
import { chatWithPlantExpert } from '../services/ai';

interface AiChatModalProps {
    plant: Plant;
    onClose: () => void;
}

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

const AiChatModal: React.FC<AiChatModalProps> = ({ plant, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', sender: 'ai', text: `Привет! Я твой ботаник-ассистент. Что тебя интересует насчет ${plant.name}?` }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const aiResponseText = await chatWithPlantExpert(userMsg.text, plant);
            const aiMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                sender: 'ai', 
                text: aiResponseText || "Извините, я не смог найти ответ." 
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
             const errorMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                sender: 'ai', 
                text: "Произошла ошибка связи с сервером AI." 
            };
             setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card rounded-2xl w-full max-w-lg h-[80vh] flex flex-col animate-fade-in-up border border-accent" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-accent bg-card rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-green-400 to-blue-500 p-1.5 rounded-lg">
                             <ChatBubbleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                             <h2 className="font-bold text-sm">Чат о {plant.name}</h2>
                             <p className="text-xs text-foreground/50">BotGardener AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-accent/5">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                ${msg.sender === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                                    : 'bg-card border border-accent rounded-bl-none shadow-sm'}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="bg-card border border-accent px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                                 <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                                 <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce delay-75"></span>
                                 <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce delay-150"></span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-accent bg-card rounded-b-2xl">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Спросите что-нибудь..."
                            className="w-full bg-accent border-none rounded-full pl-4 pr-12 py-3 focus:ring-2 focus:ring-primary text-sm"
                            disabled={isTyping}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputText.trim() || isTyping}
                            className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            <SparklesIcon className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AiChatModal;