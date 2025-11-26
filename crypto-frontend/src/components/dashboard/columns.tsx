import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Define the data shape based on OHLCV
export interface MarketDataRow {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const columnHelper = createColumnHelper<MarketDataRow>();

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
    }).format(value);
};

const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
};

export const columns = [
    columnHelper.accessor("timestamp", {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent"
                >
                    Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("open", {
        header: "Open",
        cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor("high", {
        header: "High",
        cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor("low", {
        header: "Low",
        cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor("close", {
        header: "Close",
        cell: (info) => (
            <span className="font-mono font-medium">{formatCurrency(info.getValue())}</span>
        ),
    }),
    columnHelper.accessor("volume", {
        header: "Volume",
        cell: (info) => formatNumber(info.getValue()),
    }),
];
