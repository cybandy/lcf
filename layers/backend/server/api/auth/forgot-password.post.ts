import { useValidatedBody, z } from 'h3-zod';
import { cleanupUserResetTokens, createPasswordResetToken } from '../../utils/passwordReset';

export default defineEventHandler(async (event) => {
  // Validate input
  const body = await useValidatedBody(
    event,
    z.object({
      email: z.email('Invalid email address').toLowerCase(),
    }),
  );

  try {
    // Find user by email
    const user = await findUserBy(
      eq(lower(tables.users.email), body.email.toLowerCase()),
    );

    // Always return success to prevent user enumeration
    // Even if user doesn't exist, we return the same response
    if (!user) {
      return {
        success: true,
        message:
          'If an account exists with this email, you will receive password reset instructions.',
      };
    }

    // Check if user has a password (not a social login account)
    if (!user.password) {
      return {
        success: true,
        message:
          'If an account exists with this email, you will receive password reset instructions.',
      };
    }

    // Clean up any old tokens for this user
    await cleanupUserResetTokens(user.id);

    // Create a new reset token (expires in 60 minutes)
    const resetToken = await createPasswordResetToken(user.id, 60);

    // In a real application, you would send an email here
    // For now, we'll return the token in the response (for testing)
    // TODO: Integrate email service (SendGrid, Resend, etc.)
    
    // Get the base URL for the reset link
    const headers = getHeaders(event);
    const protocol = headers['x-forwarded-proto'] || 'http';
    const host = headers['x-forwarded-host'] || headers.host || 'localhost:3000';
    const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken.token}`;

    // Log the reset URL for development
    console.log('\n=== PASSWORD RESET LINK ===');
    console.log(`User: ${user.email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token expires at: ${resetToken.expiresAt}`);
    console.log('===========================\n');

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, user.firstName, resetUrl);

    return {
      success: true,
      message:
        'If an account exists with this email, you will receive password reset instructions.',
      // Remove this in production - only for development
      ...(import.meta.dev && { resetUrl, token: resetToken.token }),
    };
  } catch (error) {
    console.error('Password reset request error:', error);

    // Always return the same generic message to prevent information leakage
    return {
      success: true,
      message:
        'If an account exists with this email, you will receive password reset instructions.',
    };
  }
});
