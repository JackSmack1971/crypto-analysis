
import React from "react";
import { useAppStore } from "@/store/app.store";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Loader2Icon } from "lucide-react";
import { Combobox } from "@/components/ui/Combobox";

export const SymbolSelector: React.FC = () => {
    const { selectedSymbol, setSymbol, selectedWatchlist } = useAppStore();

    // Fetch all symbols for global search
    const { data: allSymbols, isLoading: isLoadingSymbols, isError: isErrorSymbols, refetch: refetchSymbols } = useQuery({
        queryKey: ["allSymbols"],
        queryFn: () => apiService.getAllSymbols(),
    });

    // Fetch watchlists to filter if needed, or just to show context
    const { data: watchlists } = useQuery({
        queryKey: ["watchlists"],
        queryFn: () => apiService.getWatchlists(),
    });

    const currentWatchlist = watchlists?.find((wl) => wl.name === selectedWatchlist);

    // Prioritize watchlist assets, but allow searching all
    const watchlistAssets = React.useMemo(() => {
        if (!currentWatchlist?.assets) return [];
        return currentWatchlist.assets.map((asset: any) =>
            typeof asset === 'string' ? asset : asset.symbol || asset.id
        ).filter(Boolean);
    }, [currentWatchlist]);

    // Combine watchlist assets with all symbols, removing duplicates
    // We want watchlist assets to appear first in the list if we were just listing them,
    // but for a search combobox, we usually just want a flat list or grouped.
    // For simplicity, let's just use allSymbols as the source of truth for the dropdown,
    // but maybe pre-select or highlight.
    // Actually, the prompt implies searching.

    const options = React.useMemo(() => {
        if (!allSymbols) return [];
        const unique = Array.from(new Set([...watchlistAssets, ...allSymbols]));
        return unique.sort();
    }, [allSymbols, watchlistAssets]);

    if (isErrorSymbols) {
        return (
            <div className="relative min-w-[200px]">
                <div className="flex items-center gap-2 text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-xs">Failed to load symbols</span>
                    <button onClick={() => refetchSymbols()} className="text-xs underline hover:no-underline">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-w-[200px]">
            <div className="relative">
                {isLoadingSymbols ? (
                    <div className="flex items-center h-10 px-3 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400">
                        <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm">Loading assets...</span>
                    </div>
                ) : (
                    <Combobox
                        value={selectedSymbol}
                        onChange={setSymbol}
                        options={options}
                        placeholder="Search symbol..."
                        emptyMessage="No symbol found."
                        className="w-full"
                    />
                )}
            </div>
        </div>
    );
};

