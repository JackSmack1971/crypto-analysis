import { toast } from 'sonner';
import { AppError, ErrorCode, type ErrorContext, getUserMessage } from '@/utils/error.utils';
import { AxiosError } from 'axios';

class ErrorService {
    public handleError(error: unknown, context?: ErrorContext): void {
        const appError = this.parseError(error, context);
        this.reportError(appError);

        if (!appError.context?.silent) {
            this.showUserMessage(appError);
        }
    }

    public reportError(error: AppError): void {
        // In a real app, this would send to Sentry/LogRocket
        console.error(`[${error.code}] ${error.message}`, {
            context: error.context,
            originalError: error.originalError,
        });
    }

    private showUserMessage(error: AppError): void {
        const toastOptions: any = {
            id: error.code, // Prevent duplicates
            duration: 5000,
        };

        if (error.context?.retry) {
            toastOptions.action = {
                label: 'Retry',
                onClick: () => error.context?.retry?.(),
            };
        }

        toast.error(error.message, toastOptions);
    }

    private parseError(error: unknown, context?: ErrorContext): AppError {
        if (error instanceof AppError) {
            return new AppError(error.message, error.code, { ...error.context, ...context }, error.originalError);
        }

        if (this.isAxiosError(error)) {
            return this.parseAxiosError(error, context);
        }

        if (error instanceof Error) {
            return new AppError(error.message, ErrorCode.UNKNOWN_ERROR, context, error);
        }

        return new AppError(getUserMessage(error), ErrorCode.UNKNOWN_ERROR, context, error);
    }

    private isAxiosError(error: unknown): error is AxiosError<any> {
        return (error as AxiosError).isAxiosError === true;
    }

    private parseAxiosError(error: AxiosError<any>, context?: ErrorContext): AppError {
        const status = error.response?.status;
        const data = error.response?.data;
        const message = data?.error?.message || error.message || 'Network Error';

        let code: ErrorCode = ErrorCode.UNKNOWN_ERROR;

        if (!error.response) {
            code = ErrorCode.NETWORK_ERROR;
            return new AppError('Network error - please check your connection', code, context, error);
        }

        switch (status) {
            case 400:
                code = ErrorCode.VALIDATION_ERROR;
                break;
            case 401:
                code = ErrorCode.UNAUTHORIZED;
                break;
            case 403:
                code = ErrorCode.FORBIDDEN;
                break;
            case 404:
                code = ErrorCode.NOT_FOUND;
                break;
            case 429:
                code = ErrorCode.RATE_LIMIT;
                break;
            case 500:
            case 502:
            case 503:
            case 504:
                code = ErrorCode.SERVER_ERROR;
                break;
        }

        return new AppError(message, code, context, error);
    }
}

export const errorService = new ErrorService();
