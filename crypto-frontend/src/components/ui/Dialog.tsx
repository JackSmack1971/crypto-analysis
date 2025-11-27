import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";

export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className,
    showCloseButton = true,
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden"; // Prevent scrolling
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Portal to body to avoid z-index issues
    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Dialog Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={cn(
                                "w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl pointer-events-auto",
                                className
                            )}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {title}
                                </h3>
                                {showCloseButton && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={onClose}
                                    >
                                        <XIcon size={18} />
                                    </Button>
                                )}
                            </div>
                            <div className="p-4">{children}</div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
