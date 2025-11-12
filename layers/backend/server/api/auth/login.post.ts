import { useValidatedBody, z } from 'h3-zod';
import { findUserByWithRoles, safeUserParsingWithRoles } from '#layers/backend/server/utils/user';
// import { z } from 'zod/v3';

export default defineEventHandler(async (event) => {
  // Validate input with strict schema
  const body = await useValidatedBody(
    event,
    z.object({
      email: z.email('Invalid email address').toLowerCase(),
      password: z.string().min(1, 'Password is required'),
    }),
  );

  // Check if user is already logged in
  const { user: logged_user } = await getUserSession(event);
  if (logged_user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You are already logged in',
    });
  }

  // Fetch user by email with error handling
  let user;
  try {
    user = await findUserByWithRoles(
      eq(lower(tables.users.email), body.email.toLowerCase()),
    );
  } catch (error) {
    console.error('Database error during login:', error);
    // Use generic error to prevent timing attacks and info leakage
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed. Please try again later.',
    });
  }

  // Generic error message to prevent user enumeration
  const loginFailedError = createError({
    statusCode: 401,
    statusMessage: 'Invalid email or password',
  });

  // Check if user exists
  if (!user) {
    // Perform dummy password verification to prevent timing attacks
    await hashPassword('dummy_password_for_timing').catch(() => {});
    throw loginFailedError;
  }

  // Check if user has a password (not a social login account)
  if (!user.password) {
    // User likely registered via OAuth - no password set
    throw createError({
      statusCode: 400,
      statusMessage:
        'This account uses social login. Please sign in with Google or GitHub.',
    });
  }

  // Verify password with constant-time comparison
  let isValidPassword = false;
  try {
    isValidPassword = await verifyPassword(user.password, body.password);
  } catch (error) {
    console.error('Password verification error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed. Please try again later.',
    });
  }

  // Check password validity
  if (!isValidPassword) {
    throw loginFailedError;
  }

  // Check account status
  if (user.status === 'inactive') {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Your account has been deactivated. Please contact support.',
    });
  }

  // Remove sensitive data before setting session
  const safeUser = safeUserParsingWithRoles(user)

  // Update user session
  await updateUserSession(event, safeUser);

  // Return success
  return {
    success: true,
    user: {
      id: safeUser.id,
      email: safeUser.email,
      firstName: safeUser.firstName,
      lastName: safeUser.lastName,
    },
    message: 'Login successful',
  };
});
