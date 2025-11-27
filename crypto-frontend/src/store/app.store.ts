import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Indicator } from "@/types/market.types";

interface ChartPreferences {
    chartType: "candlestick" | "line" | "area";
    theme: "dark" | "light";
    showVolume: boolean;
    showGrid: boolean;
}

interface AppState {
    // Selection State
    selectedSymbol: string;
    selectedTimeframe: string;
    selectedWatchlist: string;

    // Chart State
    chartPreferences: ChartPreferences;
    activeIndicators: Indicator[];

    // UI State
    sidebarOpen: boolean;
    fullscreenChart: boolean;
    hasSeenOnboarding: boolean;
    hasCompletedWizard: boolean;
    userExperienceLevel: "beginner" | "intermediate" | "pro";

    // Actions
    setSymbol: (symbol: string) => void;
    setTimeframe: (timeframe: string) => void;
    setWatchlist: (watchlist: string) => void;
    toggleIndicator: (indicator: Indicator) => void;
    updateChartPreferences: (prefs: Partial<ChartPreferences>) => void;
    toggleSidebar: () => void;
    toggleFullscreen: () => void;
    completeOnboarding: () => void;
    completeWizard: () => void;
    setUserExperienceLevel: (level: "beginner" | "intermediate" | "pro") => void;
    reset: () => void;
}

const initialState = {
    selectedSymbol: "BTC/USDT",
    selectedTimeframe: "1h",
    selectedWatchlist: "Major Caps",
    chartPreferences: {
        chartType: "candlestick" as const,
        theme: "dark" as const,
        showVolume: true,
        showGrid: true,
    },
    activeIndicators: ["RSI", "MACD"] as Indicator[],
    sidebarOpen: true,
    fullscreenChart: false,
    hasSeenOnboarding: false,
    hasCompletedWizard: false,
    userExperienceLevel: "intermediate" as const,
};

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                setSymbol: (symbol) => set({ selectedSymbol: symbol }),

                setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),

                setWatchlist: (watchlist) => set({ selectedWatchlist: watchlist }),

                toggleIndicator: (indicator) =>
                    set((state) => {
                        const exists = state.activeIndicators.includes(indicator);
                        return {
                            activeIndicators: exists
                                ? state.activeIndicators.filter((i) => i !== indicator)
                                : [...state.activeIndicators, indicator],
                        };
                    }),

                updateChartPreferences: (prefs) =>
                    set((state) => ({
                        chartPreferences: { ...state.chartPreferences, ...prefs },
                    })),

                toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

                toggleFullscreen: () =>
                    set((state) => ({ fullscreenChart: !state.fullscreenChart })),

                completeOnboarding: () => set({ hasSeenOnboarding: true }),

                completeWizard: () => set({ hasCompletedWizard: true }),

                setUserExperienceLevel: (level) => set({ userExperienceLevel: level }),

                reset: () => set(initialState),
            }),
            {
                name: "crypto-app-storage",
                partialize: (state) => ({
                    selectedSymbol: state.selectedSymbol,
                    selectedTimeframe: state.selectedTimeframe,
                    chartPreferences: state.chartPreferences,
                    activeIndicators: state.activeIndicators,
                    hasSeenOnboarding: state.hasSeenOnboarding,
                    hasCompletedWizard: state.hasCompletedWizard,
                    userExperienceLevel: state.userExperienceLevel,
                }),
            }
        ),
        { name: "CryptoApp" }
    )
);
