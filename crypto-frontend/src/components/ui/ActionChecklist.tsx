import React, { useState, useEffect } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ActionChecklistProps {
    items: string[];
    onComplete: (isComplete: boolean) => void;
    className?: string;
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({
    items,
    onComplete,
    className,
}) => {
    const [checkedItems, setCheckedItems] = useState<boolean[]>(
        new Array(items.length).fill(false)
    );

    useEffect(() => {
        const allChecked = checkedItems.every(Boolean);
        onComplete(allChecked);
    }, [checkedItems, onComplete]);

    const toggleItem = (index: number) => {
        const newChecked = [...checkedItems];
        newChecked[index] = !newChecked[index];
        setCheckedItems(newChecked);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {items.map((item, index) => (
                <label
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <div className="relative flex items-center mt-0.5">
                        <input
                            type="checkbox"
                            checked={checkedItems[index]}
                            onChange={() => toggleItem(index)}
                            className="peer h-4 w-4 appearance-none rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 checked:bg-primary-500 checked:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
                        />
                        <CheckIcon
                            size={12}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                        />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                        {item}
                    </span>
                </label>
            ))}
        </div>
    );
};
