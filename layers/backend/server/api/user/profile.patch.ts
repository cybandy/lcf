import { useValidatedBody } from 'h3-zod';
import { z } from 'zod/v3';
import { findUserByIdWithRoles, safeUserParsingWithRoles } from '#layers/backend/server/utils/user';

export default defineEventHandler(async (event) => {
  // Require authenticated user
  const session = await myRequireUserSession(event);
  const userId = session.user.id;

  // Users can only update their own profile
  // (This endpoint is for self-service profile updates)

  // Validate input
  const body = await useValidatedBody(
    event,
    z.object({
      phoneNumber: z.string().optional(),
      address: z.string().optional(),
      bio: z.string().optional(),
      nationality: z.string().optional(),
      dob: z.string().datetime().optional(),
      avatar: z.string().url().optional(),
    }),
  );

  // Update user profile
  try {
    const updatedUser = await updateUser(userId, {
      phoneNumber: body.phoneNumber,
      address: body.address,
      bio: body.bio,
      nationality: body.nationality,
      dob: body.dob ? new Date(body.dob) : undefined,
      avatar: body.avatar,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    // Update session with new user data (fetch with roles)
    const userWithRoles = await findUserByIdWithRoles(userId);
    const safeUser = safeUserParsingWithRoles(userWithRoles || updatedUser);
    await updateUserSession(event, safeUser);

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: safeUser.id,
        email: safeUser.email,
        firstName: safeUser.firstName,
        lastName: safeUser.lastName,
        phoneNumber: safeUser.phoneNumber,
        address: safeUser.address,
        bio: safeUser.bio,
        nationality: safeUser.nationality,
        dob: safeUser.dob,
        avatar: safeUser.avatar,
      },
    };
  } catch (error) {
    console.error('Profile update error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile. Please try again later.',
    });
  }
});
