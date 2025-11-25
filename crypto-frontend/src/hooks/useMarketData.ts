import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import type { MarketData } from "@/types/market.types";
import { useAppStore } from "@/store/app.store";

export const useMarketData = (): UseQueryResult<MarketData, Error> => {
    const { selectedSymbol, selectedTimeframe } = useAppStore();

    return useQuery({
        queryKey: ["market-data", selectedSymbol, selectedTimeframe],
        queryFn: () => apiService.getOHLCV(selectedSymbol, selectedTimeframe, 500),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60 * 1000, // Refetch every 60 seconds
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};
