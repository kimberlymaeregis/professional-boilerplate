import { Router } from 'express';
import { AppDataSource } from '../config/data-source';

export const healthRoutes = Router();

healthRoutes.get('/', async (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        status: 'OK',
        timestamp: Date.now(),
        database: 'unknown',
    };
    
    try {
        await AppDataSource.query('SELECT 1');
        healthCheck.database = 'connected';
        
        res.status(200).json({
            success: true,
            data: healthCheck,
        });
    } catch (error) {
        healthCheck.status = 'ERROR';
        healthCheck.database = 'disconnected';
        
        res.status(503).json({
            success: false,
            data: healthCheck,
            error: {
                code: 'SERVICE_UNAVAILABLE',
                message: 'Database connection failed',
            },
        });
    }
});
