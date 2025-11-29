import React, { useState, useEffect } from "react";
import { Dialog } from "./Dialog";
import { ActionChecklist } from "./ActionChecklist";
import { Button } from "./Button";
import { AlertTriangleIcon } from "lucide-react";

export interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    checklist?: string[];
    variant?: "default" | "destructive";
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    checklist = [],
    variant = "default",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
}) => {
    const [isChecklistComplete, setIsChecklistComplete] = useState(checklist.length === 0);

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setIsChecklistComplete(checklist.length === 0);
        }
    }, [isOpen, checklist.length]);

    const handleConfirm = () => {
        if (checklist.length > 0 && !isChecklistComplete) return;
        onConfirm();
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="flex gap-4">
                    {variant === "destructive" && (
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <AlertTriangleIcon size={20} />
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {description}
                        </p>
                    </div>
                </div>

                {checklist.length > 0 && (
                    <div className="py-2">
                        <ActionChecklist
                            items={checklist}
                            onComplete={setIsChecklistComplete}
                        />
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "danger" : "primary"}
                        onClick={handleConfirm}
                        disabled={isLoading || !isChecklistComplete}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
