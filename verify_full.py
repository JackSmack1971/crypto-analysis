import asyncio
import os
import pandas as pd
import yaml
from services.storage import StorageEngine
from services.backtester import Backtester
from services.exporter import DataExporter

async def main():
    print("Starting full verification...")
    
    # 1. Load Config
    with open("config/main.yaml", "r") as f:
        config = yaml.safe_load(f)
    
    storage = StorageEngine(config['storage']['database'])
    
    # 2. Mock Data Generation (since network might fail)
    print("Generating mock data...")
    dates = pd.date_range(start='2023-01-01', periods=100, freq='1h')
    df = pd.DataFrame({
        'timestamp': dates.astype(int) // 10**6, # ms
        'open': [100 + i for i in range(100)],
        'high': [105 + i for i in range(100)],
        'low': [95 + i for i in range(100)],
        'close': [102 + i for i in range(100)],
        'volume': [1000 for _ in range(100)]
    })
    
    storage.store_ohlcv("MOCK/USDT", "1h", df)
    print("Mock data stored.")
    
    # 3. Test Backtester
    print("Testing Backtester...")
    backtester = Backtester(storage)
    
    # Load strategy
    with open("config/strategies/rsi_mean_reversion.yaml", "r") as f:
        strategy_config = yaml.safe_load(f)
        
    result = backtester.run_backtest(
        strategy_config,
        "MOCK/USDT",
        "1h",
        start_date=df['timestamp'].min(),
        end_date=df['timestamp'].max()
    )
    
    print("Backtest result keys:", result.keys())
    print("Metrics:", result.get('metrics'))
    
    # 4. Test Exporter
    print("Testing Exporter...")
    exporter = DataExporter(storage)
    path = exporter.export_ohlcv("MOCK/USDT", "1h")
    print(f"Exported OHLCV to: {path}")
    
    path_trades, path_metrics = exporter.export_backtest_results(result)
    print(f"Exported Backtest to: {path_trades}, {path_metrics}")
    
    print("Full verification complete.")

if __name__ == "__main__":
    if not os.path.exists("config"):
        os.chdir("crypto-analysis")
    asyncio.run(main())
