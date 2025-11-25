import { z } from "zod";

// ============= OHLCV Data =============
export const OHLCVSchema = z.object({
    timestamp: z.number(),
    open: z.number(),
    high: z.number(),
    low: z.number(),
    close: z.number(),
    volume: z.number(),
});

export type OHLCV = z.infer<typeof OHLCVSchema>;

export const OHLCVArraySchema = z.array(OHLCVSchema);

// ============= Indicators =============
export interface IndicatorValue {
    timestamp: number;
    value: number;
}

export interface RSIData extends IndicatorValue {
    overbought: boolean;
    oversold: boolean;
}

export interface MACDData {
    timestamp: number;
    macd: number;
    signal: number;
    histogram: number;
}

export interface BollingerBands {
    timestamp: number;
    upper: number;
    middle: number;
    lower: number;
}

export type Indicator = "RSI" | "MACD" | "BB" | "ATR" | "Ichimoku";

export interface IndicatorConfig {
    name: Indicator;
    params: Record<string, number>;
    visible: boolean;
}

// ============= Market Data =============
export const MarketDataSchema = z.object({
    symbol: z.string(),
    timeframe: z.string(),
    ohlcv: OHLCVArraySchema,
    indicators: z.record(z.string(), z.any()).optional(),
    lastUpdate: z.number(),
});

export type MarketData = z.infer<typeof MarketDataSchema>;

// ============= Multi-Timeframe =============
export interface TimeframeAnalysis {
    timeframe: string;
    trend: "bullish" | "bearish" | "neutral" | "unknown";
    strength: number;
    divergences: string[];
}

export interface MultiTimeframeData {
    symbol: string;
    timeframes: Record<string, TimeframeAnalysis>;
    alignment: "bullish_aligned" | "bearish_aligned" | "mixed";
    confluenceScore: number;
}

// ============= Backtest =============
export interface Trade {
    entryTime: number;
    entryPrice: number;
    exitTime: number;
    exitPrice: number;
    pnl: number;
    pnlPct: number;
    reason: "take_profit" | "stop_loss" | "exit_signal";
}

export interface BacktestMetrics {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalReturn: number;
    totalReturnPct: number;
}

export interface BacktestResult {
    trades: Trade[];
    metrics: BacktestMetrics;
    finalCapital: number;
}

// ============= API Responses =============
export interface APIError {
    message: string;
    code: string;
    details?: Record<string, unknown>;
}

export type APIResponse<T> =
    | { success: true; data: T }
    | { success: false; error: APIError };
