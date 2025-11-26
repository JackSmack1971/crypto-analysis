import React from "react";
import { TradingChart } from "@/components/chart/TradingChart";
import { useMarketData } from "@/hooks/useMarketData";
import { useAppStore } from "@/store/app.store";
import { Card } from "@/components/ui/Card";
import { TimeframeSelector } from "@/components/dashboard/TimeframeSelector";
import { SymbolSelector } from "@/components/dashboard/SymbolSelector";
import { MarketDataTable } from "@/components/dashboard/MarketDataTable";
import { IndicatorSelector } from "@/components/dashboard/IndicatorSelector";
import { Button } from "@/components/ui/Button";
import { TableIcon, BarChartIcon } from "lucide-react";
import { useState } from "react";

export const Dashboard: React.FC = () => {
    const { selectedSymbol } = useAppStore();
    const { data, isLoading, error } = useMarketData();
    const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">{selectedSymbol}</h2>
                    <SymbolSelector />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <Button
                            variant={viewMode === "chart" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("chart")}
                            className="h-8 w-8 p-0"
                            aria-label="View Chart"
                        >
                            <BarChartIcon size={16} />
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("table")}
                            className="h-8 w-8 p-0"
                            aria-label="View Data Table"
                        >
                            <TableIcon size={16} />
                        </Button>
                    </div>
                    <TimeframeSelector />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    {viewMode === "chart" ? (
                        <TradingChart
                            data={data?.ohlcv || []}
                            loading={isLoading}
                            error={error?.message}
                        />
                    ) : (
                        <MarketDataTable data={data?.ohlcv || []} />
                    )}
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-4">
                        <h3 className="font-semibold mb-2">Market Overview</h3>
                        {data && (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price</span>
                                    <span className="font-mono">${data.ohlcv[data.ohlcv.length - 1]?.close.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Volume</span>
                                    <span className="font-mono">{data.ohlcv[data.ohlcv.length - 1]?.volume.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card className="p-4">
                        <h3 className="font-semibold mb-2">Active Indicators</h3>
                        <IndicatorSelector />
                    </Card>
                </div>
            </div>
        </div>
    );
};
