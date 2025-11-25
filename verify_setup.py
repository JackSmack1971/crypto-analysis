import asyncio
import os
import pandas as pd
from services.storage import StorageEngine
from services.data_fetcher import DataFetcher
from services.indicators import calculate_all_indicators
import yaml

async def main():
    print("Starting verification...")
    
    # 1. Load Config
    with open("config/main.yaml", "r") as f:
        config = yaml.safe_load(f)
    print("Config loaded.")
    
    # 2. Init Storage
    db_path = config['storage']['database']
    storage = StorageEngine(db_path)
    print(f"Storage initialized at {db_path}")
    
    # 3. Init Fetcher
    fetcher = DataFetcher(config)
    print("Fetcher initialized.")
    
    # 4. Fetch Data (Test with BTC/USDT 1h)
    print("Fetching BTC/USDT 1h data...")
    df = await fetcher.fetch_ohlcv("BTC/USDT", "1h", limit=50)
    
    if df.empty:
        print("WARNING: No data fetched. Check network or API.")
    else:
        print(f"Fetched {len(df)} rows.")
        print(df.head(2))
        
        # 5. Calculate Indicators
        print("Calculating indicators...")
        indicators = calculate_all_indicators(df, ["RSI", "MACD", "BB"])
        print("Indicators calculated.")
        print(f"RSI last value: {indicators['RSI'].iloc[-1]}")
        
        # 6. Store Data
        print("Storing data...")
        storage.store_ohlcv("BTC/USDT", "1h", df)
        print("Data stored.")
        
        # 7. Retrieve Data
        print("Retrieving data...")
        df_stored = storage.get_ohlcv("BTC/USDT", "1h", limit=5)
        print(f"Retrieved {len(df_stored)} rows.")
        
    await fetcher.close()
    print("Verification complete.")

if __name__ == "__main__":
    # Ensure we are in the right directory or adjust paths
    if not os.path.exists("config"):
        os.chdir("crypto-analysis")
        
    asyncio.run(main())
