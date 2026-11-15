import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UnauthorizedError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import { createLogger } from '../utils/logger';


const logger = createLogger('AuthController');


export class AuthController {
   /**
    * POST /api/auth/login
    */
   static async login(req: Request, res: Response) {
       const { email, password } = req.body;


       const authResponse = await AuthService.login({ email, password });


       logger.info('Login successful', { userId: authResponse.user.id });
       sendSuccess(res, authResponse, 'Login successful');
   }


   /**
    * GET /api/auth/me - Get current user from token
    */
   static async getMe(req: Request, res: Response) {
       const authHeader = req.headers.authorization;


       if (!authHeader || !authHeader.startsWith('Bearer ')) {
           throw new UnauthorizedError('No token provided');
       }


       const token = authHeader.split(' ')[1];
       const user = await AuthService.getUserFromToken(token);


       sendSuccess(res, user);
   }
}

