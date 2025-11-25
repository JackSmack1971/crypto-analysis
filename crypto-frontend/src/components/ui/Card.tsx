import React from "react";
import { cn } from "@/utils/cn";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-sm",
                className
            )}
            {...props}
        />
    );
};
