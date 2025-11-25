import logging
import httpx
from typing import List, Dict
import pandas as pd

logger = logging.getLogger(__name__)

class AlertSystem:
    def __init__(self, config: dict):
        self.config = config
        self.webhooks = config.get('alerts', {}).get('webhooks', {})
        self.enabled = config.get('alerts', {}).get('enabled', True)
        
    async def check_alerts(self, symbol: str, df: pd.DataFrame, indicators: Dict):
        """Check configured alerts against current data"""
        if not self.enabled or df.empty:
            return
            
        rules = self.config.get('alerts', {}).get('rules', [])
        current_price = df['close'].iloc[-1]
        
        for rule in rules:
            if rule.get('symbol') != symbol:
                continue
                
            condition = rule.get('condition')
            # Very simple condition parser for demo
            # e.g. "RSI < 30"
            
            try:
                triggered = self._evaluate_condition(condition, current_price, indicators)
                if triggered:
                    await self._send_alert(rule['name'], f"Condition met: {condition}")
            except Exception as e:
                logger.error(f"Error evaluating alert {rule.get('name')}: {e}")

    def _evaluate_condition(self, condition: str, price: float, indicators: Dict) -> bool:
        # Safe eval context
        context = {'price': price}
        # Add indicator values (last value)
        for name, data in indicators.items():
            if isinstance(data, pd.Series):
                context[name] = data.iloc[-1]
            elif isinstance(data, pd.DataFrame):
                # Flatten, e.g. MACD_histogram
                for col in data.columns:
                    context[f"{name}_{col}"] = data[col].iloc[-1]
        
        # Security risk: eval is dangerous. In prod, use a safe parser.
        # For this local tool, we assume config is trusted or use simple parsing.
        # We'll use a very restricted eval or just simple string parsing.
        # For this demo, we'll assume simple "VAR OP VAL" format.
        
        parts = condition.split()
        if len(parts) == 3:
            var, op, val = parts
            left = context.get(var)
            right = float(val)
            
            if left is None: return False
            
            if op == '<': return left < right
            if op == '>': return left > right
            if op == '<=': return left <= right
            if op == '>=': return left >= right
            if op == '==': return left == right
            
        return False

    async def _send_alert(self, title: str, message: str):
        """Send to webhooks"""
        logger.info(f"ALERT: {title} - {message}")
        
        async with httpx.AsyncClient() as client:
            for name, url in self.webhooks.items():
                if not url or "${" in url: continue
                
                try:
                    # Discord format
                    if "discord" in name or "discord" in url:
                        await client.post(url, json={"content": f"**{title}**\n{message}"})
                    # Telegram format (simplified)
                    elif "telegram" in name:
                        # URL should include token and chat_id in real impl
                        pass
                except Exception as e:
                    logger.error(f"Failed to send webhook to {name}: {e}")
