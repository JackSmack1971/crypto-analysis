import { create } from 'zustand';

interface NotificationState {
    loadingCount: number;
    isLoading: boolean;
    systemStatus: 'idle' | 'syncing' | 'error';

    // Actions
    startLoading: () => void;
    stopLoading: () => void;
    setSystemStatus: (status: 'idle' | 'syncing' | 'error') => void;
    reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    loadingCount: 0,
    isLoading: false,
    systemStatus: 'idle',

    startLoading: () =>
        set((state) => ({
            loadingCount: state.loadingCount + 1,
            isLoading: true,
            systemStatus: 'syncing',
        })),

    stopLoading: () =>
        set((state) => {
            const newCount = Math.max(0, state.loadingCount - 1);
            return {
                loadingCount: newCount,
                isLoading: newCount > 0,
                systemStatus: newCount === 0 ? 'idle' : 'syncing',
            };
        }),

    setSystemStatus: (status) => set({ systemStatus: status }),

    reset: () => set({ loadingCount: 0, isLoading: false, systemStatus: 'idle' }),
}));
