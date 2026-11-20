import { Router } from 'express';
import { VerificationController } from '../controllers/verificationController';
import { validate } from '../middleware/validate';
import { registerSchema, emailSchema, resetPasswordSchema } from '../dto/verification.dto';
import { asyncHandler } from '../utils/asyncHandler';


export const verificationRoutes = Router();


// POST /api/auth/register - Register new user
verificationRoutes.post(
   '/register',
   validate(registerSchema),
   asyncHandler(VerificationController.register)
);


// GET /api/auth/verify-email - Verify email with token
verificationRoutes.get(
   '/verify-email',
   asyncHandler(VerificationController.verifyEmail)
);


// POST /api/auth/resend-verification - Resend verification email
verificationRoutes.post(
   '/resend-verification',
   validate(emailSchema),
   asyncHandler(VerificationController.resendVerification)
);


// POST /api/auth/forgot-password - Request password reset
verificationRoutes.post(
   '/forgot-password',
   validate(emailSchema),
   asyncHandler(VerificationController.forgotPassword)
);


// POST /api/auth/reset-password - Reset password with token
verificationRoutes.post(
   '/reset-password',
   validate(resetPasswordSchema),
   asyncHandler(VerificationController.resetPassword)
);
