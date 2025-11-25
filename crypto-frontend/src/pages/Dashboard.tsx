import React from "react";
import { TradingChart } from "@/components/chart/TradingChart";
import { useMarketData } from "@/hooks/useMarketData";
import { useAppStore } from "@/store/app.store";
import { Card } from "@/components/ui/Card";

export const Dashboard: React.FC = () => {
    const { selectedSymbol, selectedTimeframe } = useAppStore();
    const { data, isLoading, error } = useMarketData();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    {selectedSymbol} <span className="text-sm text-gray-500">{selectedTimeframe}</span>
                </h2>
                {/* Add controls here if needed */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <TradingChart
                        data={data?.ohlcv || []}
                        loading={isLoading}
                        error={error?.message}
                    />
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
                        {/* List active indicators */}
                    </Card>
                </div>
            </div>
        </div>
    );
};
