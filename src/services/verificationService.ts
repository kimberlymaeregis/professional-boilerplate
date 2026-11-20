import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { EmailService } from './emailService';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { createLogger } from '../utils/logger';


const logger = createLogger('VerificationService');
const userRepository = AppDataSource.getRepository(User);


interface RegisterInput {
   name: string;
   email: string;
   password: string;
   age?: number;
}


export class VerificationService {
   /**
    * Register new user and send verification email
    */
   static async register(input: RegisterInput) {
       const { name, email, password, age } = input;


       // 1. Check if email already exists
       const existing = await userRepository.findOne({ where: { email } });
       if (existing) {
           throw new ConflictError('Email already registered');
       }


       // 2. Hash password
       const hashedPassword = await bcrypt.hash(password, 10);


       // 3. Generate verification token
       const verificationToken = crypto.randomBytes(32).toString('hex');
       const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours


       // 4. Create user (unverified)
       const user = userRepository.create({
           name,
           email,
           password: hashedPassword,
           age,
           isVerified: false,
           verificationToken,
           verificationTokenExpiry,
       });


       await userRepository.save(user);


       // 5. Send verification email
       try {
           await EmailService.sendVerificationEmail(email, verificationToken);
           logger.info('Verification email sent', { email, userId: user.id });
       } catch (error) {
           logger.error('Failed to send verification email', { email, error });
           // Don't throw - user is created, they can request resend
       }


       return {
           message: 'Registration successful. Please check your email to verify your account.',
           userId: user.id,
       };
   }


   /**
    * Verify email with token
    */
   static async verifyEmail(token: string) {
       // 1. Find user by token
       const user = await userRepository.findOne({
           where: { verificationToken: token },
       });


       if (!user) {
           throw new BadRequestError('Invalid verification token');
       }


       // 2. Check if already verified
       if (user.isVerified) {
           throw new BadRequestError('Email already verified');
       }


       // 3. Check token expiry
       if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
           throw new BadRequestError('Verification token has expired. Please request a new one.');
       }


       // 4. Mark as verified and clear token
       user.isVerified = true;
       user.verificationToken = null;
       user.verificationTokenExpiry = null;


       await userRepository.save(user);


       logger.info('Email verified successfully', { userId: user.id, email: user.email });


       return { message: 'Email verified successfully. You can now log in.' };
   }


   /**
    * Resend verification email
    */
   static async resendVerification(email: string) {
       const user = await userRepository.findOne({ where: { email } });


       if (!user) {
           // Don't reveal if email exists (security)
           return { message: 'If an account with that email exists, a verification email has been sent.' };
       }


       if (user.isVerified) {
           return { message: 'Email already verified. You can log in.' };
       }


       // Generate new token
       const verificationToken = crypto.randomBytes(32).toString('hex');
       const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);


       user.verificationToken = verificationToken;
       user.verificationTokenExpiry = verificationTokenExpiry;


       await userRepository.save(user);


       try {
           await EmailService.sendVerificationEmail(email, verificationToken);
           logger.info('Verification email resent', { email, userId: user.id });
       } catch (error) {
           logger.error('Failed to resend verification email', { email, error });
       }


       return { message: 'If an account with that email exists, a verification email has been sent.' };
   }


   /**
    * Request password reset
    */
   static async forgotPassword(email: string) {
       const user = await userRepository.findOne({ where: { email } });


       // Always return success (prevent email enumeration)
       if (!user) {
           logger.warn('Password reset requested for non-existent email', { email });
           return { message: 'If an account with that email exists, a reset link has been sent.' };
       }


       if (!user.isVerified) {
           logger.warn('Password reset requested for unverified account', { email });
           return { message: 'If an account with that email exists, a reset link has been sent.' };
       }


       // Generate reset token
       const resetToken = crypto.randomBytes(32).toString('hex');
       const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour


       user.resetPasswordToken = resetToken;
       user.resetPasswordExpiry = resetTokenExpiry;


       await userRepository.save(user);


       try {
           await EmailService.sendPasswordResetEmail(email, resetToken);
           logger.info('Password reset email sent', { email, userId: user.id });
       } catch (error) {
           logger.error('Failed to send password reset email', { email, error });
       }


       return { message: 'If an account with that email exists, a reset link has been sent.' };
   }


   /**
    * Reset password with token
    */
   static async resetPassword(token: string, newPassword: string) {
       // 1. Find user by token
       const user = await userRepository.findOne({
           where: { resetPasswordToken: token },
       });


       if (!user) {
           throw new BadRequestError('Invalid reset token');
       }


       // 2. Check token expiry
       if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
           throw new BadRequestError('Reset token has expired. Please request a new one.');
       }


       // 3. Hash new password
       const hashedPassword = await bcrypt.hash(newPassword, 10);


       // 4. Update password and clear token
       user.password = hashedPassword;
       user.resetPasswordToken = null;
       user.resetPasswordExpiry = null;


       await userRepository.save(user);


       logger.info('Password reset successfully', { userId: user.id, email: user.email });


       return { message: 'Password reset successfully. You can now log in with your new password.' };
   }
}
