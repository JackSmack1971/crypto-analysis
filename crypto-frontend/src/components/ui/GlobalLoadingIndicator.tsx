import React from 'react';
import { useNotificationStore } from '@/store/notification.store';
import { cn } from '@/utils/cn';

export const GlobalLoadingIndicator: React.FC = () => {
    const { isLoading } = useNotificationStore();

    return (
        <div
            className={cn(
                'fixed top-0 left-0 right-0 z-[9999] h-1 bg-blue-500 transition-all duration-300 ease-in-out origin-left',
                isLoading ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
            )}
            role="progressbar"
            aria-hidden={!isLoading}
        />
    );
};
