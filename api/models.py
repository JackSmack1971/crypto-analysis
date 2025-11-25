from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union

class OHLCV(BaseModel):
    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: float

class MarketData(BaseModel):
    symbol: str
    timeframe: str
    ohlcv: List[OHLCV]
    indicators: Optional[Dict[str, Any]] = None
    lastUpdate: int

class IndicatorConfig(BaseModel):
    name: str
    params: Dict[str, float]
    visible: bool

class BacktestRequest(BaseModel):
    strategy_config: Dict[str, Any]
    symbol: str
    timeframe: str
    start_date: int
    end_date: int

class Trade(BaseModel):
    entryTime: int
    entryPrice: float
    exitTime: int
    exitPrice: float
    pnl: float
    pnlPct: float
    reason: str

class BacktestMetrics(BaseModel):
    totalTrades: int
    winningTrades: int
    losingTrades: int
    winRate: float
    totalReturn: float
    totalReturnPct: float

class BacktestResult(BaseModel):
    trades: List[Trade]
    metrics: BacktestMetrics
    finalCapital: float

class TimeframeAnalysis(BaseModel):
    timeframe: str
    trend: str
    strength: float
    divergences: List[str]

class MultiTimeframeData(BaseModel):
    symbol: str
    timeframes: Dict[str, TimeframeAnalysis]
    alignment: str
    confluenceScore: float

class APIError(BaseModel):
    message: str
    code: str
    details: Optional[Dict[str, Any]] = None

class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[APIError] = None
