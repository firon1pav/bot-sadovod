import React, { useEffect, useState, useCallback } from 'react';
import { Notification } from '../types';
import { CloseIcon } from './icons';

interface NotificationToastProps {
    notification: Notification;
    onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = useCallback(() => {
        setIsExiting(true);
        // Wait for animation to finish before actually removing from state
        setTimeout(() => {
            onDismiss(notification.id);
        }, 300); 
    }, [notification.id, onDismiss]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleDismiss();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, [handleDismiss]);

    return (
        <div 
            className={`
                bg-card border border-primary/50 rounded-lg shadow-lg p-3 flex items-start gap-3 
                transition-all duration-300 ease-in-out
                ${isExiting 
                    ? 'opacity-0 translate-x-full pointer-events-none' 
                    : 'opacity-100 translate-x-0 animate-slide-in-right'
                }
            `}
        >
            <div className="flex-shrink-0 mt-0.5">{notification.icon}</div>
            <p className="flex-grow text-sm font-medium">{notification.message}</p>
            <button 
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-accent -mr-1 -mt-1"
                aria-label="Закрыть уведомление"
            >
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default NotificationToast;