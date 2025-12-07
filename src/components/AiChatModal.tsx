
import React, { useState, useRef, useEffect } from 'react';
import { Plant } from '../types';
import { CloseIcon, ChatBubbleIcon, SparklesIcon, TrashIcon, LockIcon } from './icons';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AiChatModalProps {
    plant: Plant;
    onClose: () => void;
    onAiActionSuccess?: () => void;
}

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    isError?: boolean;
}

const AiChatModal: React.FC<AiChatModalProps> = ({ plant, onClose, onAiActionSuccess }) => {
    const initialMessage: Message = { 
        id: 'welcome', 
        sender: 'ai', 
        text: `Привет! Я твой личный ассистент-ботаник. Что тебя интересует насчет ${plant.name}?` 
    };

    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLimitReached, setIsLimitReached] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleClearHistory = () => {
        if (window.confirm('Очистить историю переписки?')) {
            setMessages([initialMessage]);
            setIsLimitReached(false);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputText };
        const currentMessages = [...messages, userMsg];
        setMessages(currentMessages);
        setInputText('');
        setIsTyping(true);

        try {
            // Prepare history for context retention
            const history = currentMessages
                .filter(m => m.id !== 'welcome' && !m.isError)
                .map(m => ({ sender: m.sender, text: m.text }));

            // Exclude the message we just added, as it's sent as the 'message' param
            const historyForBackend = history.slice(0, -1);

            // DIRECTLY CALL API instead of the simple wrapper to ensure history is passed
            const aiResponseText = await api.chatWithPlant(userMsg.text, plant.id, historyForBackend);
            
            const aiMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                sender: 'ai', 
                text: aiResponseText || "Извините, я не смог найти ответ." 
            };
            setMessages(prev => [...prev, aiMsg]);
            
            if (onAiActionSuccess) {
                onAiActionSuccess();
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.message || "";
            if (msg.includes("Limit")) {
                setIsLimitReached(true);
            } else {
                 const errorMsg: Message = { 
                    id: (Date.now() + 1).toString(), 
                    sender: 'ai', 
                    text: "Произошла ошибка связи с сервером AI.",
                    isError: true
                };
                 setMessages(prev => [...prev, errorMsg]);
            }
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
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleClearHistory} 
                            className="p-2 rounded-full hover:bg-red-500/10 text-foreground/60 hover:text-red-500 transition-colors"
                            title="Очистить историю"
                        >
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-foreground/80">
                            <CloseIcon className="w-5 h-5"/>
                        </button>
                    </div>
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
                                ${msg.isError ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
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
                    {isLimitReached && (
                        <div className="flex justify-center my-4 animate-fade-in">
                            <div className="bg-card border border-yellow-500/30 rounded-xl p-4 text-center max-w-xs shadow-lg">
                                <LockIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                <p className="font-bold text-sm mb-1">Лимит исчерпан</p>
                                <p className="text-xs text-foreground/70">Вы использовали 5/5 запросов в этом месяце. Ждем вас 1-го числа!</p>
                            </div>
                        </div>
                    )}
                    {/* Spacer for keyboard / scrolling */}
                    <div ref={messagesEndRef} className="h-4" />
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
                            disabled={isTyping || isLimitReached}
                            onFocus={scrollToBottom}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputText.trim() || isTyping || isLimitReached}
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
