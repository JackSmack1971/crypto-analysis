import React from "react";
import { InboxIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ElementType;
    action?: React.ReactNode;
    className?: string;
    compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = "No data available",
    message = "There is no data to display at this time.",
    icon: Icon = InboxIcon,
    action,
    className,
    compact = false,
}) => {
    if (compact) {
        return (
            <div className={cn("flex items-center gap-2 text-gray-400 text-sm p-2", className)}>
                <Icon size={16} />
                <span>{title}</span>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">{message}</p>
            {action && <div>{action}</div>}
        </div>
    );
};
