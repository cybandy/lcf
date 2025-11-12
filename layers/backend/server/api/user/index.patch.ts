import { useValidatedBody, z } from 'h3-zod';

export default defineEventHandler(async (event) => {
  // Require authenticated user
  const session = await myRequireUserSession(event);
  const userId = session.user.id;

  // Validate input - allow updating most user fields
  const body = await useValidatedBody(
    event,
    z.object({
      firstName: z.string().trim().min(1).max(100).optional(),
      lastName: z.string().trim().min(1).max(100).optional(),
      email: z.email().toLowerCase().optional(),
      phoneNumber: z.string().trim().optional(),
      address: z.string().trim().optional(),
      bio: z.string().trim().optional(),
      nationality: z.string().trim().optional(),
      dob: z.coerce.date().optional(),
      avatar: z.url().optional(),
      status: z.enum(['active', 'inactive', 'visitor']).optional(),
    }),
  );

  // If email is being updated, check for conflicts
  if (body.email && body.email !== session.user.email) {
    try {
      const existingUser = await findUserBy(
        eq(lower(tables.users.email), body.email.toLowerCase()),
      );

      if (existingUser && existingUser.id !== userId) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Email already in use by another account',
        });
      }
    } catch (error) {
      // If it's already our thrown error, re-throw it
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      console.error('Database error checking email:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update profile. Please try again later.',
      });
    }
  }

  // Update user profile
  try {
    const updatedUser = await updateUser(userId, {
      ...body,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    // Update session with new user data
    // const { password, githubToken, googleToken, ...safeUser } = updatedUser;
    const safeUser = safeUserParsing(updatedUser)
    await updateUserSession(event, safeUser);

    return {
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    };
  } catch (error) {
    // If it's already our thrown error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Profile update error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile. Please try again later.',
    });
  }
});
