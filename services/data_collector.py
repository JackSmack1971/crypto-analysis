import asyncio
import logging
from datetime import datetime, timedelta
from typing import List
from services.storage import StorageEngine
from services.data_fetcher import DataFetcher

logger = logging.getLogger(__name__)

class DataCollector:
    def __init__(self, storage: StorageEngine, fetcher: DataFetcher, config: dict):
        self.storage = storage
        self.fetcher = fetcher
        self.config = config
        self.running = False
        self.watchlists = self._load_watchlists()
        
    def _load_watchlists(self):
        # In a real app, this might reload from file or be passed in
        # For now, we assume config has watchlist info or we load it
        # The main config has 'watchlist_file', but we need to load it.
        # We'll assume the caller passes the loaded watchlists or we load them here.
        # For simplicity, we'll assume config has a 'watchlists' key if merged, 
        # or we just use a simple list for now.
        return self.config.get('watchlists', [])
    
    async def run_forever(self):
        """Background collection loop"""
        self.running = True
        logger.info("Starting DataCollector background loop...")
        
        while self.running:
            try:
                poll_interval = self.config.get('data_sources', {}).get('poll_intervals', {}).get('ohlcv', 60)
                
                # Iterate through watchlists
                # Note: This depends on how config is structured. 
                # If config is just main.yaml, we might need to load watchlists.yaml
                # But for now, let's assume we just fetch for a hardcoded list or what's in config
                # if passed.
                
                # We'll try to load watchlists if not present
                if not self.watchlists:
                    import yaml
                    try:
                        with open("config/watchlists.yaml", "r") as f:
                            wl_data = yaml.safe_load(f)
                            self.watchlists = wl_data.get('watchlists', [])
                    except Exception as e:
                        logger.error(f"Failed to load watchlists: {e}")
                
                for watchlist in self.watchlists:
                    for asset in watchlist.get('assets', []):
                        symbol = asset['symbol']
                        timeframes = asset.get('timeframes', ['1h'])
                        
                        for timeframe in timeframes:
                            # Check last stored timestamp
                            last_ts = self.storage.get_last_timestamp(symbol, timeframe)
                            
                            # Determine limit based on last_ts
                            limit = 500
                            if last_ts:
                                # Calculate how many candles we missed
                                # This is complex without knowing timeframe duration in ms
                                # For now, just fetch recent 50
                                limit = 50
                            
                            # Fetch new data
                            logger.info(f"Fetching {symbol} {timeframe}...")
                            new_data = await self.fetcher.fetch_ohlcv(symbol, timeframe, limit=limit)
                            
                            if not new_data.empty:
                                self.storage.store_ohlcv(symbol, timeframe, new_data)
                                logger.info(f"Stored {len(new_data)} rows for {symbol} {timeframe}")
                
                await asyncio.sleep(poll_interval)
            
            except Exception as e:
                logger.error(f"Collection error: {e}")
                await asyncio.sleep(60)  # Backoff on error
    
    def stop(self):
        self.running = False
