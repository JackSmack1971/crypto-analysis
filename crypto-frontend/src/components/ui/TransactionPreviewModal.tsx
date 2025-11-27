import React from "react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";
import type { TransactionDetails } from "@/types/transaction.types";
import { ArrowRightIcon, CopyIcon, FuelIcon, WalletIcon } from "lucide-react";
import { toast } from "sonner";

interface TransactionPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    transaction: TransactionDetails | null;
    isLoading?: boolean;
}

export const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    transaction,
    isLoading = false,
}) => {
    if (!transaction) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const formatAddress = (address?: string) => {
        if (!address) return "N/A";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const total = transaction.amount + transaction.estimatedFee;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Confirm Transaction"
            className="max-w-lg"
        >
            <div className="space-y-6">
                {/* Header: Type and Amount */}
                <div className="text-center space-y-2 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {transaction.type === "buy" ? "Buying" : transaction.type === "sell" ? "Selling" : "Sending"}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {transaction.amount} <span className="text-lg text-gray-500">{transaction.symbol}</span>
                    </div>
                </div>

                {/* Addresses */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                        <div className="text-xs text-gray-500">From</div>
                        <div className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <WalletIcon size={14} className="text-gray-400" />
                            <span className="text-sm font-mono truncate">
                                {formatAddress(transaction.fromAddress)}
                            </span>
                            {transaction.fromAddress && (
                                <button
                                    onClick={() => copyToClipboard(transaction.fromAddress!)}
                                    className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <CopyIcon size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-center pt-4 text-gray-400">
                        <ArrowRightIcon size={20} />
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="text-xs text-gray-500">To</div>
                        <div className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <WalletIcon size={14} className="text-gray-400" />
                            <span className="text-sm font-mono truncate">
                                {formatAddress(transaction.toAddress)}
                            </span>
                            {transaction.toAddress && (
                                <button
                                    onClick={() => copyToClipboard(transaction.toAddress!)}
                                    className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <CopyIcon size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="text-gray-500">Network</div>
                        <div className="font-medium">{transaction.network}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-gray-500">Est. Fee</div>
                        <div className="font-medium">{transaction.estimatedFee} ETH</div>
                    </div>
                    {transaction.gasPrice && (
                        <div className="space-y-1">
                            <div className="text-gray-500 flex items-center gap-1">
                                <FuelIcon size={12} /> Gas Price
                            </div>
                            <div className="font-medium">{transaction.gasPrice} Gwei</div>
                        </div>
                    )}
                    {transaction.gasLimit && (
                        <div className="space-y-1">
                            <div className="text-gray-500">Gas Limit</div>
                            <div className="font-medium">{transaction.gasLimit}</div>
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">Total Amount</span>
                        <div className="text-right">
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                                {total.toFixed(6)} {transaction.symbol}
                            </div>
                            <div className="text-xs text-gray-500">
                                Includes network fees
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-32"
                    >
                        {isLoading ? "Confirming..." : "Confirm"}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
