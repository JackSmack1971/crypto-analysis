import React from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"; // Removed as we use custom Modal
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { XIcon, TrendingUpIcon, TrendingDownIcon, ActivityIcon } from "lucide-react";
import type { BacktestResult } from "@/types/market.types";

interface BacktestResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: BacktestResult | null;
}

// Simple Modal implementation since we don't have a Dialog component yet
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({
    isOpen,
    onClose,
    children,
    title,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <XIcon size={18} />
                    </Button>
                </div>
                <div className="overflow-y-auto p-6">{children}</div>
            </div>
        </div>
    );
};

export const BacktestResultsModal: React.FC<BacktestResultsModalProps> = ({ isOpen, onClose, results }) => {
    if (!results) return null;

    const { metrics, trades } = results;
    const isProfitable = metrics.totalReturnPct >= 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Backtest Results">
            <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-sm text-gray-500 mb-1">Total Return</div>
                        <div className={`text-2xl font-bold ${isProfitable ? "text-green-500" : "text-red-500"} flex items-center gap-2`}>
                            {isProfitable ? <TrendingUpIcon size={20} /> : <TrendingDownIcon size={20} />}
                            {metrics.totalReturnPct.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            ${metrics.totalReturn.toFixed(2)} PnL
                        </div>
                    </Card>

                    <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-sm text-gray-500 mb-1">Win Rate</div>
                        <div className="text-2xl font-bold text-blue-500 flex items-center gap-2">
                            <ActivityIcon size={20} />
                            {(metrics.winRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {metrics.winningTrades}W / {metrics.losingTrades}L
                        </div>
                    </Card>

                    <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-sm text-gray-500 mb-1">Total Trades</div>
                        <div className="text-2xl font-bold">{metrics.totalTrades}</div>
                    </Card>

                    <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-sm text-gray-500 mb-1">Final Capital</div>
                        <div className="text-2xl font-bold">${results.finalCapital.toFixed(2)}</div>
                    </Card>
                </div>

                {/* Trades Table */}
                <div>
                    <h3 className="font-semibold mb-4">Trade History</h3>
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">Entry Time</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3 text-right">Entry Price</th>
                                    <th className="p-3 text-right">Exit Price</th>
                                    <th className="p-3 text-right">PnL</th>
                                    <th className="p-3 text-right">Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {trades.map((trade, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-3">{new Date(trade.entryTime).toLocaleString()}</td>
                                        <td className="p-3 capitalize">{trade.reason.replace("_", " ")}</td>
                                        <td className="p-3 text-right font-mono">${trade.entryPrice.toFixed(2)}</td>
                                        <td className="p-3 text-right font-mono">${trade.exitPrice.toFixed(2)}</td>
                                        <td className={`p-3 text-right font-mono ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                            {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                                        </td>
                                        <td className={`p-3 text-right font-mono ${trade.pnlPct >= 0 ? "text-green-500" : "text-red-500"}`}>
                                            {trade.pnlPct >= 0 ? "+" : ""}{trade.pnlPct.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                                {trades.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No trades executed in this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
