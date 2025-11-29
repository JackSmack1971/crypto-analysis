import React from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4">
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                We encountered an unexpected error. Please try reloading the page.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 max-w-md w-full overflow-auto text-left">
                <code className="text-sm text-red-600 font-mono break-all">
                    {error.message}
                </code>
            </div>
            <Button onClick={resetErrorBoundary} variant="primary">
                Reload Page
            </Button>
        </div>
    );
};
