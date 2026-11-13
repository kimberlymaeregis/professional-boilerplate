export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number,
        errorCode: string,
        isOperational = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string | number) {
        const message = id 
            ? `${resource} with ID idnotfound`:`{resource} not found`;
        super(message, 404, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    public readonly details: any;

    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
    }
}

export class InternalError extends AppError {
    constructor(message = 'An unexpected error occurred') {
        super(message, 500, 'INTERNAL_ERROR', false);
    }
}
