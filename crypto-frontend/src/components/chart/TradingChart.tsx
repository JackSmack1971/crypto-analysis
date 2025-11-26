import React, { useEffect, useRef } from "react";
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData, type LineData, type HistogramData, ColorType } from "lightweight-charts";
import type { OHLCV } from "@/types/market.types";
import { useAppStore } from "@/store/app.store";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface TradingChartProps {
    data: OHLCV[];
    indicators?: Record<string, any>;
    loading?: boolean;
    error?: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
    data,
    indicators,
    loading = false,
    error,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    // Indicator refs
    const indicatorSeriesRefs = useRef<Record<string, ISeriesApi<any>[]>>({});

    const { chartPreferences, activeIndicators } = useAppStore();
    const { theme, showVolume, showGrid } = chartPreferences;

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const hasOscillators = activeIndicators.some(i => ["RSI", "MACD", "ATR"].includes(i));
        const bottomMargin = showVolume ? 0.2 : 0.1;
        const oscillatorMargin = hasOscillators ? 0.25 : 0;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 600,
            layout: {
                background: { type: ColorType.Solid, color: theme === "dark" ? "#0B0E11" : "#FFFFFF" },
                textColor: theme === "dark" ? "#E4E8EB" : "#1A2332",
            },
            grid: {
                vertLines: { visible: showGrid, color: theme === "dark" ? "#1A1E23" : "#E8EAED" },
                horzLines: { visible: showGrid, color: theme === "dark" ? "#1A1E23" : "#E8EAED" },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: theme === "dark" ? "#2B2F36" : "#D1D4DC",
                scaleMargins: {
                    top: 0.1,
                    bottom: bottomMargin + oscillatorMargin,
                },
            },
            timeScale: {
                borderColor: theme === "dark" ? "#2B2F36" : "#D1D4DC",
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Candlestick series
        const candlestickSeries = chart.addSeries(
            // @ts-ignore - v5 API
            "Candlestick",
            {
                upColor: "#00C9A7",
                downColor: "#FF4757",
                borderUpColor: "#00C9A7",
                borderDownColor: "#FF4757",
                wickUpColor: "#00C9A7",
                wickDownColor: "#FF4757",
            });

        // Volume histogram
        const volumeSeries = chart.addSeries(
            // @ts-ignore - v5 API
            "Histogram",
            {
                color: theme === "dark" ? "#26a69a" : "#26a69a",
                priceFormat: {
                    type: "volume",
                },
                priceScaleId: "", // Overlay on main chart but scaled down
                scaleMargins: {
                    top: 0.8 - oscillatorMargin, // Push to bottom of main area
                    bottom: oscillatorMargin,
                },
            });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries as any;
        volumeSeriesRef.current = volumeSeries as any;

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
            chartRef.current = null;
        };
    }, [theme, showGrid, showVolume, activeIndicators]);

    // Update data and indicators
    useEffect(() => {
        if (!chartRef.current || !candlestickSeriesRef.current || !volumeSeriesRef.current || data.length === 0)
            return;

        // 1. Set OHLCV Data
        const candlestickData: CandlestickData[] = data.map((d) => ({
            time: (d.timestamp / 1000) as never,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
        candlestickSeriesRef.current.setData(candlestickData);

        // 2. Set Volume Data
        if (showVolume) {
            const volumeData: HistogramData[] = data.map((d) => ({
                time: (d.timestamp / 1000) as never,
                value: d.volume,
                color: d.close >= d.open ? "#00C9A755" : "#FF475755",
            }));
            volumeSeriesRef.current.setData(volumeData);
        }

        // 3. Handle Indicators
        // Clear existing indicators
        Object.values(indicatorSeriesRefs.current).forEach(seriesList => {
            seriesList.forEach(series => chartRef.current?.removeSeries(series));
        });
        indicatorSeriesRefs.current = {};

        if (indicators) {
            Object.entries(indicators).forEach(([name, values]) => {
                if (!values || values.length === 0) return;

                // Helper to map data
                const mapData = (valKey: string = "value"): LineData[] => {
                    return values.map((v: any) => ({
                        time: (v.timestamp / 1000) as never,
                        value: v[valKey] !== undefined ? v[valKey] : v.value,
                    }));
                };

                if (name === "RSI") {
                    const series = chartRef.current!.addSeries(
                        // @ts-ignore
                        "Line",
                        {
                            color: "#8E24AA",
                            lineWidth: 2,
                            priceScaleId: "oscillators",
                            title: "RSI",
                            scaleMargins: {
                                top: 0.8,
                                bottom: 0,
                            }
                        });
                    series.setData(mapData());
                    indicatorSeriesRefs.current["RSI"] = [series as any];
                }
                else if (name === "BB") {
                    // @ts-ignore
                    const upper = chartRef.current!.addSeries("Line", { color: "#2962FF", lineWidth: 1, title: "BB Upper" });
                    // @ts-ignore
                    const middle = chartRef.current!.addSeries("Line", { color: "#FF6D00", lineWidth: 1, title: "BB Middle" });
                    // @ts-ignore
                    const lower = chartRef.current!.addSeries("Line", { color: "#2962FF", lineWidth: 1, title: "BB Lower" });

                    upper.setData(mapData("upper"));
                    middle.setData(mapData("middle"));
                    lower.setData(mapData("lower"));

                    indicatorSeriesRefs.current["BB"] = [upper as any, middle as any, lower as any];
                }
                else if (name === "MACD") {
                    // Histogram
                    const histSeries = chartRef.current!.addSeries(
                        // @ts-ignore
                        "Histogram",
                        {
                            priceScaleId: "oscillators",
                            title: "MACD Hist",
                            scaleMargins: {
                                top: 0.8,
                                bottom: 0,
                            }
                        });
                    // MACD Line
                    const macdSeries = chartRef.current!.addSeries(
                        // @ts-ignore
                        "Line",
                        {
                            color: "#2962FF",
                            lineWidth: 2,
                            priceScaleId: "oscillators",
                            title: "MACD",
                            scaleMargins: {
                                top: 0.8,
                                bottom: 0,
                            }
                        });
                    // Signal Line
                    const signalSeries = chartRef.current!.addSeries(
                        // @ts-ignore
                        "Line",
                        {
                            color: "#FF6D00",
                            lineWidth: 2,
                            priceScaleId: "oscillators",
                            title: "Signal",
                            scaleMargins: {
                                top: 0.8,
                                bottom: 0,
                            }
                        });

                    histSeries.setData(values.map((v: any) => ({
                        time: (v.timestamp / 1000) as never,
                        value: v.histogram,
                        color: v.histogram >= 0 ? "#26a69a" : "#ef5350",
                    })));
                    macdSeries.setData(mapData("macd"));
                    signalSeries.setData(mapData("signal"));

                    indicatorSeriesRefs.current["MACD"] = [histSeries as any, macdSeries as any, signalSeries as any];
                }
                else if (name === "ATR") {
                    const series = chartRef.current!.addSeries(
                        // @ts-ignore
                        "Line",
                        {
                            color: "#D81B60",
                            lineWidth: 2,
                            priceScaleId: "oscillators",
                            title: "ATR",
                            scaleMargins: {
                                top: 0.8,
                                bottom: 0,
                            }
                        });
                    series.setData(mapData());
                    indicatorSeriesRefs.current["ATR"] = [series as any];
                }
            });
        }

        // Auto-scale
        // chartRef.current.timeScale().fitContent(); // Don't auto-fit on every update, disrupts scrolling
    }, [data, indicators, showVolume]);

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
