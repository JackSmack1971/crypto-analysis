import React, { useState } from "react";
import { useAppStore } from "@/store/app.store";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "lucide-react";

// Common pairs for quick selection
const COMMON_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"];

export const SymbolSelector: React.FC = () => {
    const { selectedSymbol, setSymbol } = useAppStore();
    const [customSymbol, setCustomSymbol] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customSymbol.trim()) {
            setSymbol(customSymbol.toUpperCase());
            setCustomSymbol("");
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {COMMON_PAIRS.map((pair) => (
                        <Button
                            key={pair}
                            variant={selectedSymbol === pair ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSymbol(pair)}
                            className="h-8 px-3 text-xs font-medium"
                        >
                            {pair.split("/")[0]}
                        </Button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            value={customSymbol}
                            onChange={(e) => setCustomSymbol(e.target.value)}
                            placeholder="Search symbol..."
                            className="h-9 pl-9 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    </div>
                </form>
            </div>
        </div>
    );
};
