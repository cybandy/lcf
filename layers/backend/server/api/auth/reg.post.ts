import { useValidatedBody, z } from 'h3-zod';
import { safeUserParsing } from '#layers/backend/server/utils/user';
// import { z } from 'zod/v3';

export default defineEventHandler(async (event) => {
  // Validate input with strict schema
  const body = await useValidatedBody(
    event,
    z.object({
      firstName: z.string().trim().min(1, 'First name is required').max(100),
      lastName: z.string().trim().min(1, 'Last name is required').max(100),
      email: z.email('Invalid email address').toLowerCase(),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  );

  // Check password strength
  const p_str = checkPasswordStrength(body.password);
  if (p_str.score < 90) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Password too weak. Use a mix of uppercase, lowercase, numbers, and special characters.',
    });
  }

  // Check if user is already logged in
  const { user: logged_user } = await getUserSession(event);
  if (logged_user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You are already logged in',
    });
  }

  // Check if email already exists
  // Use try-catch to handle DB errors gracefully
  try {
    const existingUser = await findUserBy(
      eq(lower(tables.users.email), body.email.toLowerCase()),
    );

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'An account with this email already exists',
      });
    }
  } catch (error) {
    // If it's already our thrown error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    // Otherwise, log and throw generic error to avoid leaking DB info
    console.error('Database error during registration:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed. Please try again later.',
    });
  }

  // Hash password with proper error handling
  let hashedPassword: string;
  try {
    hashedPassword = await hashPassword(body.password);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed. Please try again later.',
    });
  }

  // Create user with sanitized data
  let newUser;
  try {
    newUser = await createUser({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: hashedPassword,
      status: 'active' as const,
    });
  } catch (error) {
    console.error('User creation error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed. Please try again later.',
    });
  }

  // Remove sensitive data before setting session
  // const { password, githubToken, googleToken, ...safeUser } = newUser;
  const safeUser = safeUserParsing(newUser)

  // Set user session
  await updateUserSession(event, safeUser);

  // Return success with redirect hint
  return {
    success: true,
    redirect: '/onboarding',
    message: 'Registration successful! Please complete your profile.',
  };
});
