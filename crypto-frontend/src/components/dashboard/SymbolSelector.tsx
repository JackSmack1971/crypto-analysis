import React from "react";
import { useAppStore } from "@/store/app.store";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";

export const SymbolSelector: React.FC = () => {
    const { selectedSymbol, setSymbol, selectedWatchlist } = useAppStore();

    const { data: watchlists, isLoading, isError, refetch } = useQuery({
        queryKey: ["watchlists"],
        queryFn: () => apiService.getWatchlists(),
    });

    // Find the current watchlist object
    const currentWatchlist = watchlists?.find((wl) => wl.name === selectedWatchlist);

    // Extract assets
    const assets = React.useMemo(() => {
        if (!currentWatchlist?.assets) return [];
        return currentWatchlist.assets.map((asset: any) =>
            typeof asset === 'string' ? asset : asset.symbol || asset.id
        ).filter(Boolean);
    }, [currentWatchlist]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSymbol(e.target.value);
    };

    if (isError) {
        return (
            <div className="relative min-w-[200px]">
                <div className="flex items-center gap-2 text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-xs">Failed to load assets</span>
                    <button onClick={() => refetch()} className="text-xs underline hover:no-underline">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-w-[200px]">
            <div className="relative">
                {isLoading ? (
                    <div className="flex items-center h-10 px-3 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400">
                        <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm">Loading assets...</span>
                    </div>
                ) : (
                    <>
                        <select
                            value={selectedSymbol}
                            onChange={handleChange}
                            className="w-full h-10 pl-3 pr-10 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={assets.length === 0}
                        >
                            {assets.length > 0 ? (
                                assets.map((symbol: string) => (
                                    <option key={symbol} value={symbol}>
                                        {symbol}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No assets in {selectedWatchlist}</option>
                            )}
                        </select>
                        <ChevronDownIcon
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            size={16}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
