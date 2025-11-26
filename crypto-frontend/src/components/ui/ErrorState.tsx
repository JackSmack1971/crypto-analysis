import React from "react";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
    compact?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = "Something went wrong",
    message = "An error occurred while fetching data.",
    onRetry,
    className,
    compact = false,
}) => {
    if (compact) {
        return (
            <div className={cn("flex items-center gap-2 text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg", className)}>
                <AlertCircleIcon size={16} />
                <span className="flex-1 truncate">{message}</span>
                {onRetry && (
                    <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/40">
                        <RefreshCwIcon size={12} />
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
                <AlertCircleIcon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="secondary" className="gap-2">
                    <RefreshCwIcon size={16} />
                    Try Again
                </Button>
            )}
        </div>
    );
};
