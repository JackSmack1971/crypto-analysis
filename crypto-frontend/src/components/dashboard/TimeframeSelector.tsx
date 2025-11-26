import React from "react";
import { useAppStore } from "@/store/app.store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

const TIMEFRAMES = ["15m", "1h", "4h", "1d", "1w"];

export const TimeframeSelector: React.FC = () => {
    const { selectedTimeframe, setTimeframe } = useAppStore();

    return (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {TIMEFRAMES.map((tf) => (
                <Button
                    key={tf}
                    variant={selectedTimeframe === tf ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                    className={cn(
                        "h-8 px-3 text-xs font-medium",
                        selectedTimeframe === tf && "bg-white dark:bg-gray-700 shadow-sm"
                    )}
                >
                    {tf}
                </Button>
            ))}
        </div>
    );
};
