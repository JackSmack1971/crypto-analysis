import ccxt.async_support as ccxt
import httpx
import logging
import asyncio
from typing import List, Optional, Dict, Any
import pandas as pd

logger = logging.getLogger(__name__)

class DataFetcher:
    def __init__(self, config: dict):
        self.config = config
        self.exchange_id = config.get('data_sources', {}).get('primary_exchange', 'binance')
        self.coingecko_api_key = config.get('data_sources', {}).get('coingecko_api_key')
        self.exchange = getattr(ccxt, self.exchange_id)()
        
    async def close(self):
        if self.exchange:
            await self.exchange.close()

    async def fetch_ohlcv(self, symbol: str, timeframe: str, limit: int = 500) -> pd.DataFrame:
        """
        Fetches OHLCV data via CCXT and returns a DataFrame.
        """
        # Ensure symbol format (e.g., BTC/USDT)
        if '/' not in symbol:
            symbol = f"{symbol.upper()}/USDT"
            
        try:
            if timeframe not in self.exchange.timeframes:
                logger.warning(f"Timeframe {timeframe} not supported by {self.exchange_id}")
                return pd.DataFrame()

            ohlcv = await self.exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
            
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            return df
            
        except ccxt.NetworkError as e:
            logger.error(f"CCXT Network Error: {e}")
            return pd.DataFrame()
        except ccxt.ExchangeError as e:
            logger.error(f"CCXT Exchange Error: {e}")
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"Unexpected CCXT Error: {e}")
            return pd.DataFrame()

    async def fetch_market_data(self, per_page: int = 50) -> List[Dict[str, Any]]:
        """
        Fetches market data from CoinGecko.
        """
        base_url = "https://api.coingecko.com/api/v3"
        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": per_page,
            "page": 1,
            "sparkline": "false"
        }
        
        # Add API key if available (CoinGecko Pro or header auth)
        # Note: CoinGecko free tier doesn't strictly require key but has rate limits.
        # If key is provided, it might need to be in header or query param depending on plan.
        # Assuming free/public for now or standard header if key exists.
        headers = {}
        if self.coingecko_api_key and "${" not in self.coingecko_api_key:
             headers["x-cg-demo-api-key"] = self.coingecko_api_key

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{base_url}/coins/markets", params=params, headers=headers)
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                logger.error(f"CoinGecko Error: {e}")
                return []
    
    async def fetch_global_data(self) -> Dict[str, Any]:
        base_url = "https://api.coingecko.com/api/v3"
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{base_url}/global")
                resp.raise_for_status()
                return resp.json().get("data", {})
            except Exception as e:
                logger.error(f"CoinGecko Global Error: {e}")
                return {}
