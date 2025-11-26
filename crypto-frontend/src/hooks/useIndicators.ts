import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { useAppStore } from "@/store/app.store";

export const useIndicators = (): UseQueryResult<Record<string, unknown>, Error> => {
    const { selectedSymbol, selectedTimeframe, activeIndicators } = useAppStore();

    return useQuery({
        queryKey: ["indicators", selectedSymbol, selectedTimeframe, activeIndicators],
        queryFn: () => {
            if (activeIndicators.length === 0) {
                return Promise.resolve({});
            }
            return apiService.getIndicators(selectedSymbol, selectedTimeframe, activeIndicators);
        },
        enabled: activeIndicators.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60 * 1000, // Refetch every 60 seconds
    });
};
