import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const requestLogger = createLogger('HTTP');

export const requestLoggingMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    req.headers['x-request-id'] = requestId;
    
    const startTime = Date.now();
    
    requestLogger.info('Incoming request', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        const logData = {
            requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        };
        
        if (res.statusCode >= 500) {
            requestLogger.error('Request failed', logData);
        } else if (res.statusCode >= 400) {
            requestLogger.warn('Request error', logData);
        } else {
            requestLogger.info('Request completed', logData);
        }
    });
    
    next();
};
