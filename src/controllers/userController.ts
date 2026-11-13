import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated, createPaginationMeta } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('UserController');

export class UserController {
    static async getAll(req: Request, res: Response) {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;
        
        const [users, total] = await UserService.findAll({
            page: Number(page),
            limit: Number(limit),
            sort: sort as string,
            order: order as 'ASC' | 'DESC',
        });
        
        const meta = createPaginationMeta(total, Number(page), Number(limit));
        
        logger.info('Users retrieved', { count: total, page, limit });
        sendPaginated(res, users, meta);
    }

    static async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const user = await UserService.findById(id);
        
        logger.info('User retrieved', { userId: id });
        sendSuccess(res, user);
    }

    static async create(req: Request, res: Response) {
        const user = await UserService.create(req.body);
        
        logger.info('User created', { userId: user.id, email: user.email });
        sendCreated(res, user, 'User created successfully');
    }

    static async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        const user = await UserService.update(id, req.body);
        
        logger.info('User updated', { userId: id });
        sendSuccess(res, user, 'User updated successfully');
    }

    static async delete(req: Request, res: Response) {
        const id = Number(req.params.id);
        await UserService.delete(id);
        
        logger.info('User deleted', { userId: id });
        sendNoContent(res);
    }
}
