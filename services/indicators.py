import pandas as pd
import numpy as np
from typing import Dict, List

class IndicatorEngine:
    """Unified indicator calculation with caching"""
    
    @staticmethod
    def calculate_all(df: pd.DataFrame, 
                      indicators: List[str]) -> Dict[str, pd.Series]:
        """Dispatch to specific calculators"""
        results = {}
        
        if df.empty:
            return results

        for indicator in indicators:
            # Handle parameterized indicators if needed, for now assume simple names
            # e.g. "RSI" -> calc_rsi
            method_name = f"calc_{indicator.lower()}"
            if hasattr(IndicatorEngine, method_name):
                calc_func = getattr(IndicatorEngine, method_name)
                results[indicator] = calc_func(df)
        
        return results
    
    @staticmethod
    def calc_rsi(df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Relative Strength Index"""
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        return 100 - (100 / (1 + rs))
    
    @staticmethod
    def calc_macd(df: pd.DataFrame, 
                  fast: int = 12, slow: int = 26, signal: int = 9):
        """MACD with histogram"""
        ema_fast = df['close'].ewm(span=fast, adjust=False).mean()
        ema_slow = df['close'].ewm(span=slow, adjust=False).mean()
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=signal, adjust=False).mean()
        histogram = macd - signal_line
        
        return pd.DataFrame({
            'macd': macd,
            'signal': signal_line,
            'histogram': histogram
        })
    
    @staticmethod
    def calc_bb(df: pd.DataFrame, 
                            period: int = 20, std_dev: float = 2.0):
        """Bollinger Bands"""
        sma = df['close'].rolling(window=period).mean()
        std = df['close'].rolling(window=period).std()
        
        return pd.DataFrame({
            'upper': sma + (std * std_dev),
            'middle': sma,
            'lower': sma - (std * std_dev)
        })
    
    @staticmethod
    def calc_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Average True Range"""
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = np.max(ranges, axis=1)
        
        return true_range.rolling(window=period).mean()

    @staticmethod
    def calc_ichimoku(df: pd.DataFrame):
        """Ichimoku Cloud components"""
        # Tenkan-sen (Conversion Line): (9-period high + 9-period low)/2
        high_9 = df['high'].rolling(window=9).max()
        low_9 = df['low'].rolling(window=9).min()
        tenkan = (high_9 + low_9) / 2
        
        # Kijun-sen (Base Line): (26-period high + 26-period low)/2
        high_26 = df['high'].rolling(window=26).max()
        low_26 = df['low'].rolling(window=26).min()
        kijun = (high_26 + low_26) / 2
        
        # Senkou Span A (Leading Span A): (Conversion + Base)/2
        senkou_a = ((tenkan + kijun) / 2).shift(26)
        
        # Senkou Span B (Leading Span B): (52-period high + 52-period low)/2
        high_52 = df['high'].rolling(window=52).max()
        low_52 = df['low'].rolling(window=52).min()
        senkou_b = ((high_52 + low_52) / 2).shift(26)
        
        # Chikou Span (Lagging Span): Close shifted back 26 periods
        chikou = df['close'].shift(-26)
        
        return pd.DataFrame({
            'tenkan': tenkan,
            'kijun': kijun,
            'senkou_a': senkou_a,
            'senkou_b': senkou_b,
            'chikou': chikou
        })
    
    @staticmethod
    def calc_volume_profile(df: pd.DataFrame, bins: int = 50):
        """Volume Profile / Volume-at-Price"""
        if df.empty:
            return pd.DataFrame()
            
        price_min, price_max = df['close'].min(), df['close'].max()
        price_bins = np.linspace(price_min, price_max, bins)
        
        volume_at_price = []
        # Note: This is a simplified calculation. 
        # A more accurate one would distribute volume across the candle's range.
        # But for now, we assign candle volume to the close price bin.
        
        # Create bins
        df['bin'] = pd.cut(df['close'], bins=price_bins, labels=price_bins[:-1], include_lowest=True)
        grouped = df.groupby('bin')['volume'].sum().reset_index()
        
        return pd.DataFrame({
            'price_level': grouped['bin'],
            'volume': grouped['volume']
        })

# Helper function for easy import
def calculate_all_indicators(df: pd.DataFrame, indicators: List[str]) -> Dict[str, pd.Series]:
    return IndicatorEngine.calculate_all(df, indicators)
