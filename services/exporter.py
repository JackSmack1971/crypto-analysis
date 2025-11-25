import pandas as pd
from services.storage import StorageEngine

class DataExporter:
    def __init__(self, storage: StorageEngine):
        self.storage = storage
    
    def export_ohlcv(self, symbol: str, timeframe: str,
                    start: int = None, end: int = None,
                    format: str = 'csv') -> str:
        """Export historical data"""
        df = self.storage.get_ohlcv(symbol, timeframe, start, end)
        
        if df.empty:
            return ""
            
        # Sanitize filename
        safe_symbol = symbol.replace('/', '_')
        output_path = f"exports/{safe_symbol}_{timeframe}_{start or 'start'}_{end or 'end'}.{format}"
        
        if format == 'csv':
            df.to_csv(output_path, index=False)
        elif format == 'parquet':
            df.to_parquet(output_path, index=False)
        elif format == 'json':
            df.to_json(output_path, orient='records')
        
        return output_path
    
    def export_backtest_results(self, backtest_results: dict, format: str = 'csv') -> tuple:
        """Export backtest with trade log"""
        trades = backtest_results.get('trades', [])
        metrics = backtest_results.get('metrics', {})
        
        trades_df = pd.DataFrame(trades)
        metrics_df = pd.DataFrame([metrics])
        
        import time
        ts = int(time.time())
        trades_path = f"exports/backtest_{ts}_trades.{format}"
        metrics_path = f"exports/backtest_{ts}_metrics.{format}"
        
        if format == 'csv':
            trades_df.to_csv(trades_path, index=False)
            metrics_df.to_csv(metrics_path, index=False)
        
        return trades_path, metrics_path
