import { useValidatedBody, z } from 'h3-zod';
import { deleteAllUserResetTokens, findValidResetToken, markTokenAsUsed } from '../../utils/passwordReset';

export default defineEventHandler(async (event) => {
  // Validate input
  const body = await useValidatedBody(
    event,
    z.object({
      token: z.string().min(1, 'Reset token is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  );

  try {
    // Find valid reset token
    const resetToken = await findValidResetToken(body.token);

    if (!resetToken) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Invalid or expired reset token. Please request a new password reset.',
      });
    }

    // Check password strength
    const passwordStrength = checkPasswordStrength(body.password);
    if (passwordStrength.score < 90) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Password too weak. Use a mix of uppercase, lowercase, numbers, and special characters.',
      });
    }

    // Hash the new password
    let hashedPassword: string;
    try {
      hashedPassword = await hashPassword(body.password);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Password reset failed. Please try again later.',
      });
    }

    // Update user's password
    const updatedUser = await updateUser(resetToken.userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found.',
      });
    }

    // Mark token as used
    await markTokenAsUsed(resetToken.id);

    // Delete all other reset tokens for this user
    await deleteAllUserResetTokens(resetToken.userId);

    // Clear any existing sessions for this user (optional security measure)
    // This forces the user to log in with their new password
    await clearUserSession(event);

    return {
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    };
  } catch (error) {
    // If it's already our thrown error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Password reset error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Password reset failed. Please try again later.',
    });
  }
});
