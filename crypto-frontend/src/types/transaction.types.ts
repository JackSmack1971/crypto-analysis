export interface TransactionDetails {
    type: 'buy' | 'sell' | 'send';
    symbol: string;
    amount: number;
    fromAddress?: string;
    toAddress?: string;
    network: string;
    estimatedFee: number; // in native currency (e.g., ETH)
    gasLimit?: number;
    gasPrice?: number; // in Gwei
}
