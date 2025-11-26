import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/app.store";
import { BacktestResultsModal } from "./BacktestResultsModal";
import { Loader2Icon, PlayIcon, SettingsIcon } from "lucide-react";
import type { BacktestResult } from "@/types/market.types";
import { toast } from "sonner";

import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

export const BacktestForm: React.FC = () => {
    const { selectedSymbol, selectedTimeframe } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [results, setResults] = useState<BacktestResult | null>(null);

    // Form State
    const [rsiPeriod, setRsiPeriod] = useState(14);
    const [oversold, setOversold] = useState(30);
    const [overbought, setOverbought] = useState(70);
    const [daysToBacktest, setDaysToBacktest] = useState(30);

    const { mutate: runBacktest, isPending } = useMutation({
        mutationFn: async () => {
            const endDate = Date.now();
            const startDate = endDate - daysToBacktest * 24 * 60 * 60 * 1000;

            const config = {
                strategy_name: "rsi_mean_reversion",
                rsi_period: rsiPeriod,
                oversold,
                overbought,
            };

            return apiService.runBacktest(
                config,
                selectedSymbol,
                selectedTimeframe,
                startDate,
                endDate
            );
        },
        onSuccess: (data) => {
            setResults(data);
            setIsModalOpen(true);
            toast.success("Backtest completed successfully");
        },
        onError: (error: Error) => {
            toast.error(`Backtest failed: ${error.message}`);
        },
    });

    useKeyboardShortcut("enter", () => {
        runBacktest();
    }, { ctrlKey: true, preventDefault: true });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runBacktest();
    };

    return (
        <>
            <Card id="tour-backtest" className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <SettingsIcon size={16} />
                        Strategy Tester
                    </h3>
                    <div className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        RSI Mean Reversion
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">RSI Period</label>
                            <input
                                type="number"
                                value={rsiPeriod}
                                onChange={(e) => setRsiPeriod(Number(e.target.value))}
                                className="w-full h-8 px-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                min={2}
                                max={50}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Days History</label>
                            <input
                                type="number"
                                value={daysToBacktest}
                                onChange={(e) => setDaysToBacktest(Number(e.target.value))}
                                className="w-full h-8 px-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                min={1}
                                max={365}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Oversold</label>
                            <input
                                type="number"
                                value={oversold}
                                onChange={(e) => setOversold(Number(e.target.value))}
                                className="w-full h-8 px-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                min={1}
                                max={49}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Overbought</label>
                            <input
                                type="number"
                                value={overbought}
                                onChange={(e) => setOverbought(Number(e.target.value))}
                                className="w-full h-8 px-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                                min={51}
                                max={99}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                        title="Run Backtest (Ctrl+Enter)"
                    >
                        {isPending ? (
                            <>
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <PlayIcon className="mr-2 h-4 w-4" />
                                Run Backtest
                            </>
                        )}
                    </Button>
                </form>
            </Card>

            <BacktestResultsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                results={results}
            />
        </>
    );
};
