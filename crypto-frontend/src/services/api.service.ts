import axios, { type AxiosInstance, type AxiosError } from "axios";
import type { MarketData, BacktestResult, MultiTimeframeData, APIResponse } from "@/types/market.types";
import { useNotificationStore } from "@/store/notification.store";
import { errorService } from "@/services/error.service";

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
                // Start global loading
                useNotificationStore.getState().startLoading();

                // Add auth token if available
                const token = localStorage.getItem("auth_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                useNotificationStore.getState().stopLoading();
                useNotificationStore.getState().setSystemStatus('error');
                errorService.handleError(error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                useNotificationStore.getState().stopLoading();
                return response;
            },
            (error: AxiosError<APIResponse<never>>) => {
                useNotificationStore.getState().stopLoading();
                useNotificationStore.getState().setSystemStatus('error');

                // Retry logic for GET requests
                const config = error.config;
                if (config && config.method === 'get' && !config.headers['X-Retry']) {
                    const retry = () => {
                        config.headers['X-Retry'] = 'true';
                        return this.client(config);
                    };
                    errorService.handleError(error, { retry });
                } else {
                    errorService.handleError(error);
                }

                return Promise.reject(error);
            }
        );
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

    async getAllSymbols(): Promise<string[]> {
        const response = await this.client.get<APIResponse<string[]>>("/api/v1/symbols");

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
