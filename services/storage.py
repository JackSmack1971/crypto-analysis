import sqlite3
import pandas as pd
from contextlib import contextmanager
import json
import os
from typing import Optional, List, Dict, Any

class StorageEngine:
    def __init__(self, db_path: str):
        self.db_path = db_path
        # Ensure directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._init_schema()
    
    @contextmanager
    def get_conn(self):
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
            
    def _init_schema(self):
        with self.get_conn() as conn:
            # Historical OHLCV storage
            conn.execute("""
            CREATE TABLE IF NOT EXISTS ohlcv (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                timeframe TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                open REAL NOT NULL,
                high REAL NOT NULL,
                low REAL NOT NULL,
                close REAL NOT NULL,
                volume REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(symbol, timeframe, timestamp)
            );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_tf_ts ON ohlcv(symbol, timeframe, timestamp DESC);")

            # Pre-calculated indicators cache
            conn.execute("""
            CREATE TABLE IF NOT EXISTS indicators_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                timeframe TEXT NOT NULL,
                indicator_name TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                value REAL NOT NULL,
                metadata JSON,
                UNIQUE(symbol, timeframe, indicator_name, timestamp)
            );
            """)

            # Strategy backtest results
            conn.execute("""
            CREATE TABLE IF NOT EXISTS backtest_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                strategy_name TEXT NOT NULL,
                symbol TEXT NOT NULL,
                timeframe TEXT NOT NULL,
                start_date INTEGER NOT NULL,
                end_date INTEGER NOT NULL,
                total_trades INTEGER,
                win_rate REAL,
                sharpe_ratio REAL,
                max_drawdown REAL,
                total_return REAL,
                parameters JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # Alert configurations
            conn.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                condition TEXT NOT NULL,
                webhook_url TEXT,
                enabled BOOLEAN DEFAULT 1,
                last_triggered TIMESTAMP
            );
            """)
    
    def store_ohlcv(self, symbol: str, timeframe: str, df: pd.DataFrame):
        """Bulk insert with conflict resolution"""
        if df.empty:
            return
            
        # Ensure required columns exist
        required_cols = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        if not all(col in df.columns for col in required_cols):
            raise ValueError(f"DataFrame missing required columns: {required_cols}")
            
        # Add symbol and timeframe columns for storage
        df_to_store = df.copy()
        df_to_store['symbol'] = symbol
        df_to_store['timeframe'] = timeframe
        
        # Select only relevant columns
        cols = ['symbol', 'timeframe'] + required_cols
        df_to_store = df_to_store[cols]
        
        with self.get_conn() as conn:
            # Use replace or ignore logic? 
            # The user requested "Bulk insert with conflict resolution".
            # Pandas to_sql doesn't support UPSERT easily without SQLAlchemy engine or custom method.
            # We'll use a custom method for SQLite UPSERT (INSERT OR REPLACE/IGNORE)
            
            # Convert to list of tuples
            data = df_to_store.to_dict('records')
            
            conn.executemany("""
                INSERT OR REPLACE INTO ohlcv (symbol, timeframe, timestamp, open, high, low, close, volume)
                VALUES (:symbol, :timeframe, :timestamp, :open, :high, :low, :close, :volume)
            """, data)
    
    def get_ohlcv(self, symbol: str, timeframe: str, 
                  start: int = None, end: int = None, limit: int = None) -> pd.DataFrame:
        """Retrieve with optional time range"""
        query = """
            SELECT timestamp, open, high, low, close, volume
            FROM ohlcv
            WHERE symbol = ? AND timeframe = ?
        """
        params = [symbol, timeframe]
        
        if start:
            query += " AND timestamp >= ?"
            params.append(start)
        if end:
            query += " AND timestamp <= ?"
            params.append(end)
        
        query += " ORDER BY timestamp ASC"
        
        if limit:
            query += f" LIMIT {limit}"
        
        with self.get_conn() as conn:
            return pd.read_sql(query, conn, params=params)

    def get_last_timestamp(self, symbol: str, timeframe: str) -> Optional[int]:
        query = """
            SELECT MAX(timestamp) 
            FROM ohlcv 
            WHERE symbol = ? AND timeframe = ?
        """
        with self.get_conn() as conn:
            cursor = conn.execute(query, (symbol, timeframe))
            result = cursor.fetchone()
            return result[0] if result else None
