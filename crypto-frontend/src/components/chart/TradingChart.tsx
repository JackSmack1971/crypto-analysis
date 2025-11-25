import React, { useEffect, useRef } from "react";
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData } from "lightweight-charts";
import type { OHLCV } from "@/types/market.types";
import { useAppStore } from "@/store/app.store";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface TradingChartProps {
    data: OHLCV[];
    loading?: boolean;
    error?: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
    data,
    loading = false,
    error,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const { chartPreferences } = useAppStore();
    const { theme, showVolume, showGrid } = chartPreferences;

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 600,
            layout: {
                background: { color: theme === "dark" ? "#0B0E11" : "#FFFFFF" },
                textColor: theme === "dark" ? "#E4E8EB" : "#1A2332",
            },
            grid: {
                vertLines: { visible: showGrid, color: theme === "dark" ? "#1A1E23" : "#E8EAED" },
                horzLines: { visible: showGrid, color: theme === "dark" ? "#1A1E23" : "#E8EAED" },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    width: 1,
                    color: theme === "dark" ? "#505357" : "#9B9B9B",
                    style: 3,
                },
                horzLine: {
                    width: 1,
                    color: theme === "dark" ? "#505357" : "#9B9B9B",
                    style: 3,
                },
            },
            rightPriceScale: {
                borderColor: theme === "dark" ? "#2B2F36" : "#D1D4DC",
                scaleMargins: {
                    top: 0.1,
                    bottom: showVolume ? 0.3 : 0.1,
                },
            },
            timeScale: {
                borderColor: theme === "dark" ? "#2B2F36" : "#D1D4DC",
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Candlestick series
        const candlestickSeries = (chart as any).addCandlestickSeries({
            upColor: "#00C9A7",
            downColor: "#FF4757",
            borderUpColor: "#00C9A7",
            borderDownColor: "#FF4757",
            wickUpColor: "#00C9A7",
            wickDownColor: "#FF4757",
        });

        // Volume histogram
        const volumeSeries = (chart as any).addHistogramSeries({
            color: theme === "dark" ? "#26a69a" : "#26a69a",
            priceFormat: {
                type: "volume",
            },
            priceScaleId: "",
            scaleMargins: {
                top: 0.7,
                bottom: 0,
            },
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        // Handle window resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [theme, showGrid, showVolume]);

    // Update data
    useEffect(() => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current || data.length === 0)
            return;

        const candlestickData: CandlestickData[] = data.map((d) => ({
            time: (d.timestamp / 1000) as never,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));

        const volumeData = data.map((d) => ({
            time: (d.timestamp / 1000) as never,
            value: d.volume,
            color: d.close >= d.open ? "#00C9A755" : "#FF475755",
        }));

        candlestickSeriesRef.current.setData(candlestickData);

        if (showVolume) {
            volumeSeriesRef.current.setData(volumeData);
        }

        // Auto-scale to fit data
        chartRef.current?.timeScale().fitContent();
    }, [data, showVolume]);

    if (loading) {
        return (
            <Card className="p-4">
                <Skeleton className="w-full h-[600px]" />
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-4">
                <div role="alert" className="text-red-500 text-center py-8">
                    <p className="text-lg font-semibold">Chart Error</p>
                    <p className="text-sm mt-2">{error}</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-0 overflow-hidden">
            <div ref={chartContainerRef} className="w-full" />
        </Card>
    );
};
