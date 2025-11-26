import axios, { type AxiosInstance, type AxiosError } from "axios";
import type { MarketData, BacktestResult, MultiTimeframeData, APIResponse } from "@/types/market.types";

import { toast } from "@/components/ui/Toast";

class APIService {
    private client: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem("auth_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError<APIResponse<never>>) => {
                this.handleError(error);
                return Promise.reject(error);
            }
        );
    }

    private handleError(error: AxiosError<APIResponse<never>>): void {
        if (!error.response) {
            toast.error("Network error - please check your connection");
            return;
        }

        const { status, data } = error.response;
        const errorMessage = (data && !data.success && data.error?.message) || "An unexpected error occurred";

        switch (status) {
            case 400:
                toast.error(`Invalid request: ${errorMessage}`);
                break;
            case 401:
                toast.error("Authentication required");
                // Redirect to login
                break;
            case 403:
                toast.error("Access denied");
                break;
            case 404:
                toast.error("Resource not found");
                break;
            case 429:
                toast.error("Rate limit exceeded - please wait");
                break;
            case 500:
                toast.error("Server error - please try again later");
                break;
            default:
                toast.error(errorMessage);
        }
    }

    // ============= Market Data Endpoints =============
    async getOHLCV(
        symbol: string,
        timeframe: string,
        limit?: number
    ): Promise<MarketData> {
        const response = await this.client.get<APIResponse<MarketData>>(
            `/api/v1/ohlcv/${encodeURIComponent(symbol)}/${timeframe}`,
            { params: { limit } }
        );

        if (!response.data.success) {
            throw new Error(response.data.error?.message || "Unknown error");
        }

        return response.data.data!;
    }

    async getIndicators(
        symbol: string,
        timeframe: string,
        indicators: string[]
    ): Promise<Record<string, unknown>> {
        const response = await this.client.get<APIResponse<Record<string, unknown>>>(
            `/api/v1/indicators/${encodeURIComponent(symbol)}/${timeframe}`,
            { params: { indicators: indicators.join(",") } }
        );

        if (!response.data.success) {
            throw new Error(response.data.error?.message || "Unknown error");
        }

        return response.data.data!;
    }

    async getMultiTimeframe(symbol: string): Promise<MultiTimeframeData> {
        const response = await this.client.get<APIResponse<MultiTimeframeData>>(
            `/api/v1/multi-timeframe/${encodeURIComponent(symbol)}`
        );

        if (!response.data.success) {
            throw new Error(response.data.error?.message || "Unknown error");
        }

        return response.data.data!;
    }

    // ============= Backtest Endpoints =============
    async runBacktest(
        strategyConfig: Record<string, unknown>,
        symbol: string,
        timeframe: string,
        startDate: number,
        endDate: number
    ): Promise<BacktestResult> {
        const response = await this.client.post<APIResponse<BacktestResult>>(
            "/api/v1/backtest",
            {
                strategy_config: strategyConfig,
                symbol,
                timeframe,
                start_date: startDate,
                end_date: endDate,
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.error?.message || "Unknown error");
        }

        return response.data.data!;
    }

    // ============= Watchlist Endpoints =============
    async getWatchlists(): Promise<Array<{ name: string; assets: unknown[] }>> {
        const response = await this.client.get<
            APIResponse<Array<{ name: string; assets: unknown[] }>>
        >("/api/v1/watchlists");

        if (!response.data.success) {
            throw new Error(response.data.error?.message || "Unknown error");
        }

        return response.data.data!;
    }

    async createWatchlist(name: string): Promise<Array<{ name: string; assets: unknown[] }>> {
        const response = await this.client.post<
            APIResponse<Array<{ name: string; assets: unknown[] }>>
        >("/api/v1/watchlists", { name });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || "Unknown error");
        }

        return response.data.data!;
    }

    async updateWatchlist(
        name: string,
        newName: string,
        assets?: unknown[]
    ): Promise<Array<{ name: string; assets: unknown[] }>> {
        const response = await this.client.put<
            APIResponse<Array<{ name: string; assets: unknown[] }>>
        >(`/api/v1/watchlists/${encodeURIComponent(name)}`, { new_name: newName, assets });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || "Unknown error");
        }

        return response.data.data!;
    }

    async deleteWatchlist(name: string): Promise<Array<{ name: string; assets: unknown[] }>> {
        const response = await this.client.delete<
            APIResponse<Array<{ name: string; assets: unknown[] }>>
        >(`/api/v1/watchlists/${encodeURIComponent(name)}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || "Unknown error");
        }

        return response.data.data!;
    }
}

// Singleton export
export const apiService = new APIService();
