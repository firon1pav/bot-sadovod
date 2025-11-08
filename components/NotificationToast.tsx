import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { CloseIcon } from './icons';

interface NotificationToastProps {
    notification: Notification;
    onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleDismiss();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss(notification.id);
        }, 300); // Match animation duration
    };

    return (
        <div 
            className={`
                bg-card border border-primary/50 rounded-lg shadow-lg p-3 flex items-start gap-3 transition-all duration-300 ease-out
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
            style={{ animation: 'slide-in-right 0.3s ease-out' }}
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
