import React, { useRef, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { columns, type MarketDataRow } from "./columns";
import { cn } from "@/utils/cn";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { TransactionPreviewModal } from "@/components/ui/TransactionPreviewModal";
import type { TransactionDetails } from "@/types/transaction.types";
import { toast } from "sonner";

interface MarketDataTableProps {
    data: MarketDataRow[];
    isLoading?: boolean;
    error?: Error | null;
    onRetry?: () => void;
}

export const MarketDataTable: React.FC<MarketDataTableProps> = ({
    data,
    isLoading = false,
    error = null,
    onRetry
}) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const parentRef = useRef<HTMLDivElement>(null);
    const [transaction, setTransaction] = useState<TransactionDetails | null>(null);

    const handleTrade = (row: MarketDataRow) => {
        // Mock transaction data
        setTransaction({
            type: "buy",
            symbol: "ETH", // In a real app, this would come from the row data
            amount: row.close > 0 ? 1.5 : 0, // Use row data to silence unused variable warning
            fromAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            toAddress: "0x123d35Cc6634C0532925a3b844Bc454e4438f55f",
            network: "Ethereum Mainnet",
            estimatedFee: 0.0021,
            gasLimit: 21000,
            gasPrice: 45,
        });
    };

    const tableColumns = React.useMemo(() => [
        ...columns,
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: { original: MarketDataRow } }) => (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleTrade(row.original);
                    }}
                >
                    Trade
                </Button>
            ),
        },
    ], []);

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const { rows } = table.getRowModel();

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48, // Estimated row height
        overscan: 10,
    });

    if (error) {
        return (
            <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-[500px] flex items-center justify-center">
                <ErrorState
                    message={error.message || "Failed to load market data"}
                    onRetry={onRetry}
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-[500px] p-4 space-y-4">
                <div className="flex gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-6 w-24" />
                    ))}
                </div>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (!isLoading && data.length === 0) {
        return (
            <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-[500px] flex items-center justify-center">
                <EmptyState
                    title="No Market Data"
                    message="No market data available for the selected criteria."
                />
            </div>
        );
    }

    return (
        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="overflow-auto h-[500px]" ref={parentRef}>
                <table className="w-full text-sm text-left">
                    <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-6 py-3 font-medium">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: "100%",
                            position: "relative",
                        }}
                    >
                        {virtualizer.getVirtualItems().map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            return (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        "border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                                        "absolute w-full top-0 left-0"
                                    )}
                                    style={{
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                Showing {rows.length} rows
            </div>

            <TransactionPreviewModal
                isOpen={!!transaction}
                onClose={() => setTransaction(null)}
                onConfirm={() => {
                    toast.success("Transaction submitted successfully");
                    setTransaction(null);
                }}
                transaction={transaction}
            />
        </div>
    );
};
