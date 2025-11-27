export interface GlossaryTerm {
    term: string;
    definition: string;
    category: "General" | "Technical Analysis" | "Trading" | "DeFi";
}

export const glossaryTerms: GlossaryTerm[] = [
    {
        term: "RSI (Relative Strength Index)",
        definition: "A momentum indicator used in technical analysis that measures the magnitude of recent price changes to evaluate overbought or oversold conditions in the price of a stock or other asset.",
        category: "Technical Analysis",
    },
    {
        term: "MACD (Moving Average Convergence Divergence)",
        definition: "A trend-following momentum indicator that shows the relationship between two moving averages of a security's price.",
        category: "Technical Analysis",
    },
    {
        term: "Bollinger Bands",
        definition: "A technical analysis tool defined by a set of trendlines plotted two standard deviations (positively and negatively) away from a simple moving average (SMA) of a security's price.",
        category: "Technical Analysis",
    },
    {
        term: "Bullish",
        definition: "An optimistic outlook on an asset's price direction, expecting it to rise.",
        category: "General",
    },
    {
        term: "Bearish",
        definition: "A pessimistic outlook on an asset's price direction, expecting it to fall.",
        category: "General",
    },
    {
        term: "Limit Order",
        definition: "An order to buy or sell a stock at a specific price or better.",
        category: "Trading",
    },
    {
        term: "Market Order",
        definition: "An order to buy or sell a stock immediately at the best available current price.",
        category: "Trading",
    },
    {
        term: "Stop-Loss",
        definition: "An order placed with a broker to buy or sell a specific stock once the stock reaches a certain price, designed to limit an investor's loss on a position.",
        category: "Trading",
    },
    {
        term: "Gas Fee",
        definition: "A fee paid to network validators for processing a transaction on a blockchain network like Ethereum.",
        category: "DeFi",
    },
    {
        term: "Volatility",
        definition: "A statistical measure of the dispersion of returns for a given security or market index.",
        category: "General",
    },
];
