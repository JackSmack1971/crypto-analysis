from dataclasses import dataclass
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from services.storage import StorageEngine
from services.indicators import IndicatorEngine

@dataclass
class Trade:
    entry_time: int
    entry_price: float
    exit_time: int
    exit_price: float
    pnl: float
    pnl_pct: float
    reason: str  # "take_profit", "stop_loss", "exit_signal"

class Backtester:
    def __init__(self, storage: StorageEngine):
        self.storage = storage
    
    def run_backtest(self, 
                    strategy_config: dict,
                    symbol: str,
                    timeframe: str,
                    start_date: int,
                    end_date: int,
                    initial_capital: float = 10000.0) -> Dict:
        """Execute backtest with proper position sizing"""
        
        # Load historical data
        df = self.storage.get_ohlcv(symbol, timeframe, start_date, end_date)
        
        if df.empty:
            return {'error': 'No data found for backtest range'}

        # Calculate required indicators
        # Extract indicators from config (simplified parsing)
        # For now, just calculate common ones
        indicators = IndicatorEngine.calculate_all(df, ["RSI", "MACD", "BB", "ATR"])
        
        # Add indicators to DF for easier condition checking
        for name, data in indicators.items():
            if isinstance(data, pd.Series):
                df[name] = data
            elif isinstance(data, pd.DataFrame):
                for col in data.columns:
                    df[f"{name}_{col}"] = data[col]
        
        # Simulate trades
        trades = []
        capital = initial_capital
        position = None
        entry_price = 0
        entry_idx = 0
        
        params = strategy_config.get('strategy', {}).get('parameters', {})
        rsi_oversold = params.get('rsi_oversold', 30)
        rsi_overbought = params.get('rsi_overbought', 70)
        
        # Simple loop for RSI Mean Reversion logic (hardcoded for now as parser is complex)
        # In a real engine, we'd parse the 'entry_conditions' from YAML dynamically.
        
        for i in range(14, len(df)):
            current_bar = df.iloc[i]
            
            if position is None:
                # Entry: RSI < Oversold
                if current_bar['RSI'] < rsi_oversold:
                    position = "long"
                    entry_price = current_bar['close']
                    entry_idx = i
            else:
                # Exit: RSI > 50 or Stop Loss / Take Profit
                # Simplified exit logic
                current_price = current_bar['close']
                pnl_pct = (current_price - entry_price) / entry_price
                
                exit_signal = current_bar['RSI'] > 50
                stop_loss = pnl_pct < -0.02
                take_profit = pnl_pct > 0.05
                
                if exit_signal or stop_loss or take_profit:
                    reason = "signal"
                    if stop_loss: reason = "stop_loss"
                    if take_profit: reason = "take_profit"
                    
                    pnl = (current_price - entry_price) * (initial_capital * 0.1 / entry_price) # Fixed position size logic
                    
                    trade = Trade(
                        entry_time=df.iloc[entry_idx]['timestamp'],
                        entry_price=entry_price,
                        exit_time=current_bar['timestamp'],
                        exit_price=current_price,
                        pnl=pnl,
                        pnl_pct=pnl_pct,
                        reason=reason
                    )
                    trades.append(trade)
                    capital += pnl
                    position = None
        
        # Calculate metrics
        metrics = self._calculate_metrics(trades, initial_capital, df)
        
        return {
            'trades': [t.__dict__ for t in trades],
            'metrics': metrics,
            'final_capital': capital
        }
    
    def _calculate_metrics(self, trades: List[Trade], 
                          initial_capital: float,
                          df: pd.DataFrame) -> Dict:
        """Comprehensive performance metrics"""
        if not trades:
            return {'total_trades': 0, 'win_rate': 0, 'total_return': 0}
        
        total_trades = len(trades)
        winning_trades = [t for t in trades if t.pnl > 0]
        losing_trades = [t for t in trades if t.pnl <= 0]
        
        win_rate = len(winning_trades) / total_trades if total_trades > 0 else 0
        
        # Returns
        total_return = sum(t.pnl for t in trades)
        total_return_pct = (total_return / initial_capital) * 100
        
        return {
            'total_trades': total_trades,
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': win_rate,
            'total_return': total_return,
            'total_return_pct': total_return_pct,
        }
