export const ErrorCode = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export interface ErrorContext {
    retry?: () => Promise<unknown>;
    silent?: boolean;
    [key: string]: unknown;
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly context?: ErrorContext;
    public readonly originalError?: unknown;

    constructor(message: string, code: ErrorCode, context?: ErrorContext, originalError?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.context = context;
        this.originalError = originalError;
    }
}

export const getUserMessage = (error: unknown): string => {
    if (error instanceof AppError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
};
