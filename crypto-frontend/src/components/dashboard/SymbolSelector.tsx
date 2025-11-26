import React from "react";
import { useAppStore } from "@/store/app.store";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";

export const SymbolSelector: React.FC = () => {
    const { selectedSymbol, setSymbol, selectedWatchlist } = useAppStore();

    const { data: watchlists, isLoading } = useQuery({
        queryKey: ["watchlists"],
        queryFn: () => apiService.getWatchlists(),
    });

    // Find the current watchlist object
    const currentWatchlist = watchlists?.find((wl) => wl.name === selectedWatchlist);

    // Extract assets, defaulting to empty array if not found
    // The API returns assets as unknown[], we assume they are strings or objects with a symbol property
    // Based on common patterns, let's assume they are strings for now, or handle objects if needed.
    // If assets are objects { symbol: "BTC/USDT", ... }, we map them.
    // If assets are strings "BTC/USDT", we use them directly.
    const assets = React.useMemo(() => {
        if (!currentWatchlist?.assets) return [];
        return currentWatchlist.assets.map((asset: any) =>
            typeof asset === 'string' ? asset : asset.symbol || asset.id
        ).filter(Boolean);
    }, [currentWatchlist]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSymbol(e.target.value);
    };

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
                            className="w-full h-10 pl-3 pr-10 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer"
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
