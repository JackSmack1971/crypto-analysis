from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Any
import yaml
import asyncio
import pandas as pd
from datetime import datetime

from api.models import (
    MarketData, OHLCV, BacktestRequest, BacktestResult, 
    MultiTimeframeData, APIResponse, APIError,
    Trade, BacktestMetrics, TimeframeAnalysis
)
from services.data_fetcher import DataFetcher
from services.storage import StorageEngine
from services.indicators import IndicatorEngine
from services.backtester import Backtester
from services.multi_timeframe import MultiTimeframeAnalyzer

# Load Config
def load_config():
    with open("config/main.yaml", "r") as f:
        return yaml.safe_load(f)

def load_watchlists():
    with open("config/watchlists.yaml", "r") as f:
        return yaml.safe_load(f)

config = load_config()
watchlists = load_watchlists()

app = FastAPI(title="Crypto Analysis API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
storage = StorageEngine(config['storage']['database'])
fetcher = DataFetcher(config)
backtester = Backtester(storage)
mtf_analyzer = MultiTimeframeAnalyzer(storage)

@app.on_event("shutdown")
async def shutdown_event():
    await fetcher.close()

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }

def success_response(data: Any):
    return APIResponse(success=True, data=data)

def error_response(message: str, code: str = "INTERNAL_ERROR"):
    return APIResponse(success=False, error=APIError(message=message, code=code))

def save_watchlists(data):
    with open("config/watchlists.yaml", "w") as f:
        yaml.dump(data, f)

@app.get("/api/v1/watchlists")
async def get_watchlists():
    # Reload to get latest changes
    global watchlists
    watchlists = load_watchlists()
    return success_response(watchlists['watchlists'])

@app.post("/api/v1/watchlists")
async def create_watchlist(name: str = Body(..., embed=True)):
    global watchlists
    watchlists = load_watchlists()
    
    if any(w['name'] == name for w in watchlists['watchlists']):
        return error_response("Watchlist already exists", "DUPLICATE")
        
    new_watchlist = {
        "name": name,
        "assets": []
    }
    
    watchlists['watchlists'].append(new_watchlist)
    save_watchlists(watchlists)
    return success_response(watchlists['watchlists'])

@app.put("/api/v1/watchlists/{name}")
async def update_watchlist(name: str, new_name: str = Body(..., embed=True), assets: Optional[List[dict]] = Body(None, embed=True)):
    global watchlists
    watchlists = load_watchlists()
    
    watchlist = next((w for w in watchlists['watchlists'] if w['name'] == name), None)
    if not watchlist:
        return error_response("Watchlist not found", "NOT_FOUND")
        
    if new_name and new_name != name:
        if any(w['name'] == new_name for w in watchlists['watchlists']):
            return error_response("Watchlist name already exists", "DUPLICATE")
        watchlist['name'] = new_name
        
    if assets is not None:
        watchlist['assets'] = assets
        
    save_watchlists(watchlists)
    return success_response(watchlists['watchlists'])

@app.delete("/api/v1/watchlists/{name}")
async def delete_watchlist(name: str):
    global watchlists
    watchlists = load_watchlists()
    
    initial_len = len(watchlists['watchlists'])
    watchlists['watchlists'] = [w for w in watchlists['watchlists'] if w['name'] != name]
    
    if len(watchlists['watchlists']) == initial_len:
        return error_response("Watchlist not found", "NOT_FOUND")
        
    save_watchlists(watchlists)
    return success_response(watchlists['watchlists'])

@app.get("/api/v1/symbols")
async def get_symbols(watchlist: Optional[str] = None):
    if watchlist:
        wl = next((w for w in watchlists['watchlists'] if w['name'] == watchlist), None)
        if not wl:
            return error_response("Watchlist not found", "NOT_FOUND")
        return success_response([a['symbol'] for a in wl['assets']])
    
    # Return all unique symbols
    all_symbols = set()
    for wl in watchlists['watchlists']:
        for asset in wl['assets']:
            all_symbols.add(asset['symbol'])
    return success_response(list(all_symbols))

@app.get("/api/v1/ohlcv/{symbol:path}/{timeframe}")
async def get_ohlcv(symbol: str, timeframe: str, limit: int = 500):
    # Decode symbol if needed (FastAPI handles path params well, but just in case)
    # symbol e.g. BTC/USDT -> BTC/USDT
    
    try:
        # Try fetch live for now as per app.py logic
        df = await fetcher.fetch_ohlcv(symbol, timeframe, limit)
        
        if df.empty:
             return error_response(f"No data found for {symbol}", "NO_DATA")
        
        # Store async (fire and forget in real app, here sync for simplicity or just skip)
        storage.store_ohlcv(symbol, timeframe, df)
        
        # Convert to model
        ohlcv_list = []
        for _, row in df.iterrows():
            ohlcv_list.append(OHLCV(
                timestamp=int(row['timestamp']),
                open=row['open'],
                high=row['high'],
                low=row['low'],
                close=row['close'],
                volume=row['volume']
            ))
            
        return success_response(MarketData(
            symbol=symbol,
            timeframe=timeframe,
            ohlcv=ohlcv_list,
            lastUpdate=int(datetime.now().timestamp() * 1000)
        ))
        
    except Exception as e:
        return error_response(str(e))

@app.get("/api/v1/indicators/{symbol:path}/{timeframe}")
async def get_indicators(symbol: str, timeframe: str, indicators: str = Query(...)):
    indicator_list = indicators.split(",")
    
    # We need data first
    df = await fetcher.fetch_ohlcv(symbol, timeframe, 500)
    if df.empty:
        return error_response("No data for indicators", "NO_DATA")
        
    results = IndicatorEngine.calculate_all(df, indicator_list)
    
    # Convert Pandas objects to dicts/lists for JSON serialization
    serialized_results = {}
    for name, data in results.items():
        if isinstance(data, pd.DataFrame):
            serialized_results[name] = data.to_dict(orient='records')
        elif isinstance(data, pd.Series):
            serialized_results[name] = data.tolist() # Or dict with timestamp? 
            # For simplicity in this prototype, let's just return the values list matching OHLCV index
            # Ideally we should align timestamps.
            
            # Better approach: return list of objects {timestamp, value}
            # But the existing engine returns Series without index alignment guarantee in return type doc?
            # Actually engine returns Series/DF with same index as input DF usually.
            # Let's assume 1:1 mapping with the fetched OHLCV for now.
            pass
            
            # Re-mapping to include timestamps for safer frontend consumption
            values = []
            for idx, val in data.items():
                # idx is likely integer index if reset_index wasn't called, or timestamp if set as index
                # The fetcher returns integer index.
                ts = df.iloc[idx]['timestamp'] if isinstance(idx, int) and idx < len(df) else 0
                values.append({"timestamp": ts, "value": val})
            serialized_results[name] = values

    # Actually, let's simplify. The frontend expects specific structures.
    # We will just return the raw dicts and let frontend parse or refine here.
    # To make it robust, let's just return the last 500 points as list of dicts.
    
    final_data = {}
    for name, data in results.items():
        if isinstance(data, pd.DataFrame):
            # e.g. MACD, BB
            # Add timestamp
            data_with_ts = data.copy()
            data_with_ts['timestamp'] = df['timestamp']
            final_data[name] = data_with_ts.to_dict(orient='records')
        else:
            # Series (RSI)
            final_data[name] = [{"timestamp": t, "value": v} for t, v in zip(df['timestamp'], data)]

    return success_response(final_data)

@app.post("/api/v1/backtest")
async def run_backtest(request: BacktestRequest):
    try:
        result = backtester.run_backtest(
            {"strategy": request.strategy_config},
            request.symbol,
            request.timeframe,
            request.start_date,
            request.end_date
        )
        
        if 'error' in result:
             return error_response(result['error'])
             
        # Map to Pydantic models
        trades = []
        for t in result['trades']:
            trades.append(Trade(
                entryTime=t['entry_time'],
                entryPrice=t['entry_price'],
                exitTime=t['exit_time'],
                exitPrice=t['exit_price'],
                pnl=t['pnl'],
                pnlPct=t['pnl_pct'],
                reason=t['reason']
            ))
            
        metrics = BacktestMetrics(
            totalTrades=result['metrics']['total_trades'],
            winningTrades=result['metrics']['winning_trades'],
            losingTrades=result['metrics']['losing_trades'],
            winRate=result['metrics']['win_rate'],
            totalReturn=result['metrics']['total_return'],
            totalReturnPct=result['metrics']['total_return_pct']
        )
        
        return success_response(BacktestResult(
            trades=trades,
            metrics=metrics,
            finalCapital=result['final_capital']
        ))
        
    except Exception as e:
        return error_response(str(e))

@app.get("/api/v1/multi-timeframe/{symbol:path}")
async def get_multi_timeframe(symbol: str):
    try:
        analysis = mtf_analyzer.analyze_symbol(symbol)
        
        tf_analysis = {}
        for tf, data in analysis['timeframes'].items():
            tf_analysis[tf] = TimeframeAnalysis(
                timeframe=tf,
                trend=data['trend'],
                strength=float(data['strength']),
                divergences=data['divergences']
            )
            
        return success_response(MultiTimeframeData(
            symbol=symbol,
            timeframes=tf_analysis,
            alignment=analysis['alignment'],
            confluenceScore=analysis['confluence_score']
        ))
    except Exception as e:
        return error_response(str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
