import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import yaml
import asyncio
from services.data_fetcher import DataFetcher
from services.indicators import calculate_all_indicators
from services.storage import StorageEngine
import os

# Page Config
st.set_page_config(layout="wide", page_title="Crypto Analysis Platform")

# Load Config
@st.cache_resource
def load_config():
    with open("config/main.yaml", "r") as f:
        return yaml.safe_load(f)

@st.cache_resource
def load_watchlists():
    with open("config/watchlists.yaml", "r") as f:
        return yaml.safe_load(f)

config = load_config()
watchlists = load_watchlists()

# Initialize Services
@st.cache_resource
def get_storage():
    return StorageEngine(config['storage']['database'])

@st.cache_resource
def get_fetcher():
    return DataFetcher(config)

storage = get_storage()
fetcher = get_fetcher()

# Sidebar
with st.sidebar:
    st.header("Configuration")
    
    # Watchlist Selection
    watchlist_names = [w['name'] for w in watchlists['watchlists']]
    selected_watchlist_name = st.selectbox("Watchlist", watchlist_names)
    
    selected_watchlist = next(w for w in watchlists['watchlists'] if w['name'] == selected_watchlist_name)
    
    # Asset Selection
    assets = [a['symbol'] for a in selected_watchlist['assets']]
    symbol = st.selectbox("Asset", options=assets)
    
    # Timeframe Selection
    # Get timeframes for selected asset
    asset_config = next(a for a in selected_watchlist['assets'] if a['symbol'] == symbol)
    timeframe = st.selectbox("Timeframe", asset_config.get('timeframes', ["1h", "4h", "1d"]))
    
    # Indicator Selection
    available_indicators = ["RSI", "MACD", "BB", "ATR", "Ichimoku"]
    default_indicators = asset_config.get('indicators', [])
    # Filter defaults to only those available
    default_indicators = [i for i in default_indicators if i in available_indicators]
    
    indicator_set = st.multiselect("Indicators", available_indicators, default=default_indicators)
    
    if st.button("Refresh Data"):
        st.cache_data.clear()

# Main Logic
async def get_data(symbol, timeframe, limit=500):
    # Try to get from storage first (not implemented fully for "latest" yet, so just fetch)
    # For this phase, we'll fetch live to demonstrate connectivity, 
    # and store it.
    
    # Fetch live
    df = await fetcher.fetch_ohlcv(symbol, timeframe, limit)
    
    if not df.empty:
        # Store in background (or here for simplicity)
        storage.store_ohlcv(symbol, timeframe, df)
    
    return df

# Run async loop
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
ohlcv = loop.run_until_complete(get_data(symbol, timeframe))

if ohlcv.empty:
    st.error(f"No data found for {symbol} on {timeframe}")
else:
    # Calculate Indicators
    indicators = calculate_all_indicators(ohlcv, indicator_set)

    # Layout
    col1, col2 = st.columns([3, 1])

    with col1:
        st.subheader(f"{symbol} - {timeframe}")
        
        # Create Chart
        fig = go.Figure()
        
        # Candlestick
        fig.add_trace(go.Candlestick(
            x=ohlcv['timestamp'],
            open=ohlcv['open'],
            high=ohlcv['high'],
            low=ohlcv['low'],
            close=ohlcv['close'],
            name="Price"
        ))
        
        # Overlays (BB, Ichimoku)
        if "BB" in indicators:
            bb = indicators["BB"]
            fig.add_trace(go.Scatter(x=ohlcv['timestamp'], y=bb['upper'], name="BB Upper", line=dict(width=1, dash='dash')))
            fig.add_trace(go.Scatter(x=ohlcv['timestamp'], y=bb['lower'], name="BB Lower", line=dict(width=1, dash='dash')))
            
        if "Ichimoku" in indicators:
            ichimoku = indicators["Ichimoku"]
            # Add Tenkan and Kijun
            fig.add_trace(go.Scatter(x=ohlcv['timestamp'], y=ichimoku['tenkan'], name="Tenkan"))
            fig.add_trace(go.Scatter(x=ohlcv['timestamp'], y=ichimoku['kijun'], name="Kijun"))
            
        fig.update_layout(height=600, xaxis_rangeslider_visible=False)
        st.plotly_chart(fig, use_container_width=True)
        
        # Subplots for oscillators (RSI, MACD)
        if "RSI" in indicators:
            rsi_fig = go.Figure()
            rsi_fig.add_trace(go.Scatter(x=ohlcv['timestamp'], y=indicators["RSI"], name="RSI"))
            rsi_fig.add_hline(y=70, line_dash="dash", line_color="red")
            rsi_fig.add_hline(y=30, line_dash="dash", line_color="green")
            rsi_fig.update_layout(height=200, title="RSI", margin=dict(t=20, b=20))
            st.plotly_chart(rsi_fig, use_container_width=True)
            
        if "MACD" in indicators:
            macd = indicators["MACD"]
            macd_fig = go.Figure()
            macd_fig.add_trace(go.Scatter(x=ohlcv['timestamp'], y=macd['macd'], name="MACD"))
            macd_fig.add_trace(go.Scatter(x=ohlcv['timestamp'], y=macd['signal'], name="Signal"))
            macd_fig.add_bar(x=ohlcv['timestamp'], y=macd['histogram'], name="Hist")
            macd_fig.update_layout(height=200, title="MACD", margin=dict(t=20, b=20))
            st.plotly_chart(macd_fig, use_container_width=True)

    with col2:
        st.subheader("Market Overview")
        
        current_price = ohlcv['close'].iloc[-1]
        prev_price = ohlcv['close'].iloc[-2]
        change = ((current_price - prev_price) / prev_price) * 100
        
        st.metric("Current Price", f"${current_price:,.2f}", f"{change:.2f}%")
        
        st.markdown("### Indicator Values")
        latest_indicators = {}
        for name, data in indicators.items():
            if isinstance(data, pd.DataFrame):
                # For DF indicators (MACD, BB), show last row
                latest_indicators[name] = data.iloc[-1].to_dict()
            else:
                # Series
                latest_indicators[name] = data.iloc[-1]
        
        st.json(latest_indicators)
        
        st.markdown("### Data Info")
        st.text(f"Records: {len(ohlcv)}")
        st.text(f"Start: {pd.to_datetime(ohlcv['timestamp'].iloc[0], unit='ms')}")
        st.text(f"End: {pd.to_datetime(ohlcv['timestamp'].iloc[-1], unit='ms')}")
