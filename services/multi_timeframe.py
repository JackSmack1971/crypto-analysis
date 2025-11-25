import pandas as pd
from typing import List, Dict
from services.storage import StorageEngine
from services.indicators import IndicatorEngine

class MultiTimeframeAnalyzer:
    def __init__(self, storage: StorageEngine):
        self.storage = storage
    
    def analyze_symbol(self, symbol: str, 
                      timeframes: List[str] = ['1h', '4h', '1d']):
        """Cross-timeframe analysis"""
        results = {}
        
        for tf in timeframes:
            df = self.storage.get_ohlcv(symbol, tf, limit=200)
            
            if df.empty:
                results[tf] = {'trend': 'unknown', 'strength': 0, 'divergences': []}
                continue
                
            # Calculate indicators for each timeframe
            indicators = IndicatorEngine.calculate_all(df, 
                ['RSI', 'MACD', 'BB'])
            
            results[tf] = {
                'trend': self._determine_trend(df, indicators),
                'strength': self._calculate_strength(indicators),
                'divergences': self._detect_divergences(df, indicators)
            }
        
        # Cross-timeframe alignment check
        alignment = self._check_alignment(results)
        
        return {
            'timeframes': results,
            'alignment': alignment,
            'confluence_score': self._confluence_score(results)
        }
    
    def _determine_trend(self, df: pd.DataFrame, indicators: dict) -> str:
        """Trend classification based on multiple indicators"""
        if df.empty or len(df) < 20:
            return "unknown"
            
        # Price action: Higher highs and higher lows
        recent_highs = df['high'].tail(20)
        recent_lows = df['low'].tail(20)
        
        price_trend = "bullish" if (recent_highs.iloc[-1] > recent_highs.iloc[0] and
                                    recent_lows.iloc[-1] > recent_lows.iloc[0]) else "bearish"
        
        # MACD confirmation
        if 'MACD' in indicators:
            macd = indicators['MACD']
            macd_trend = "bullish" if macd['histogram'].iloc[-1] > 0 else "bearish"
        else:
            macd_trend = price_trend
        
        # Confluence
        return price_trend if price_trend == macd_trend else "neutral"

    def _calculate_strength(self, indicators: dict) -> float:
        """Calculate trend strength 0-100"""
        strength = 50
        
        if 'RSI' in indicators:
            rsi = indicators['RSI'].iloc[-1]
            if rsi > 50:
                strength += (rsi - 50)
            else:
                strength -= (50 - rsi)
                
        return max(0, min(100, strength))

    def _detect_divergences(self, df: pd.DataFrame, indicators: dict) -> List[str]:
        """Detect simple divergences"""
        divergences = []
        # Placeholder logic
        return divergences

    def _check_alignment(self, results: Dict) -> str:
        """Check if timeframes are aligned"""
        trends = [data['trend'] for data in results.values()]
        if all(t == 'bullish' for t in trends):
            return "bullish_aligned"
        elif all(t == 'bearish' for t in trends):
            return "bearish_aligned"
        return "mixed"

    def _confluence_score(self, results: Dict) -> float:
        """Calculate overall confluence score"""
        score = 0
        count = 0
        for tf, data in results.items():
            if data['trend'] == 'bullish':
                score += 1
            elif data['trend'] == 'bearish':
                score -= 1
            count += 1
        
        if count == 0:
            return 0
            
        return score / count
