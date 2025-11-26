import React from "react";
import { useAppStore } from "@/store/app.store";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "lucide-react";
import type { Indicator } from "@/types/market.types";

const AVAILABLE_INDICATORS: Indicator[] = ["RSI", "MACD", "BB", "ATR", "Ichimoku"];

export const IndicatorSelector: React.FC = () => {
    const { activeIndicators, toggleIndicator } = useAppStore();

    return (
        <div className="flex flex-wrap gap-2">
            {AVAILABLE_INDICATORS.map((indicator) => {
                const isActive = activeIndicators.includes(indicator);
                return (
                    <Button
                        key={indicator}
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => toggleIndicator(indicator)}
                        className="flex items-center gap-1.5"
                    >
                        {isActive && <CheckIcon size={14} />}
                        {indicator}
                    </Button>
                );
            })}
        </div>
    );
};
