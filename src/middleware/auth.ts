import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UnauthorizedError } from '../utils/errors';
import { createLogger } from '../utils/logger';


const logger = createLogger('AuthMiddleware');


// Extend Express Request type to include user
declare global {
   namespace Express {
       interface Request {
           user?: {
               userId: number;
               email: string;
           };
       }
   }
}


/**
* Authentication middleware
* Extracts and validates JWT token from Authorization header
*/
export const authMiddleware = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
       // 1. Extract token from Authorization header
       const authHeader = req.headers.authorization;


       if (!authHeader) {
           throw new UnauthorizedError('No token provided');
       }


       // 2. Check format: "Bearer <token>"
       if (!authHeader.startsWith('Bearer ')) {
           throw new UnauthorizedError('Invalid token format. Use: Bearer <token>');
       }


       // 3. Extract token
       const token = authHeader.split(' ')[1];


       if (!token) {
           throw new UnauthorizedError('No token provided');
       }


       // 4. Verify token
       const decoded = await AuthService.verifyToken(token);


       // 5. Attach user data to request
       req.user = decoded;


       logger.debug('Token validated', { userId: decoded.userId });


       // 6. Continue to next middleware/route
       next();
   } catch (error) {
       if (error instanceof UnauthorizedError) {
           logger.warn('Authentication failed', {
               path: req.path,
               error: error.message,
           });
           next(error);
       } else {
           logger.error('Auth middleware error', { error });
           next(new UnauthorizedError('Authentication failed'));
       }
   }
};
