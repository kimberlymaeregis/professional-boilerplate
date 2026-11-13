import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let isOperational = false;
    let details: any = undefined;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorCode = err.errorCode;
        message = err.message;
        isOperational = err.isOperational;
        
        if (err instanceof ValidationError) {
            details = err.details;
        }
    } 
    else if (err.name === 'QueryFailedError') {
        statusCode = 400;
        errorCode = 'DATABASE_ERROR';
        message = 'Database operation failed';
        logger.error('Database error:', err);
    }
    else if (err instanceof SyntaxError && 'body' in err) {
        statusCode = 400;
        errorCode = 'INVALID_JSON';
        message = 'Invalid JSON in request body';
    }
    else {
        logger.error('Unexpected error:', err);
    }

    if (isOperational) {
        logger.warn(`Operational error: ${message}`, {
            errorCode,
            path: req.path,
            method: req.method,
        });
    } else {
        logger.error('Unexpected error:', {
            error: err,
            path: req.path,
            method: req.method,
        });
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`,
        },
    });
};
