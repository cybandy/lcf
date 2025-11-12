export default defineEventHandler(async (event) => {
  // Require authenticated user
  const session = await myRequireUserSession(event);
  const userId = session.user.id;

  try {
    // Get user to check if exists
    const user = await findUserById(userId);

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    // Delete user's avatar from blob storage if exists
    if (user.avatar && user.avatar.startsWith('avatars/')) {
      try {
        await deleteAvatar(user.avatar);
      } catch (error) {
        // Log but don't fail the deletion if avatar cleanup fails
        console.error('Failed to delete user avatar:', error);
      }
    }

    // Delete all password reset tokens
    try {
      const db = useDrizzle();
      await db
        .delete(tables.passwordResetTokens)
        .where(eq(tables.passwordResetTokens.userId, userId))
        .run();
    } catch (error) {
      console.error('Failed to delete password reset tokens:', error);
    }

    // Delete user from database
    const db = useDrizzle();
    
    // Note: Related records in other tables should be handled by ON DELETE CASCADE
    // or manual cleanup depending on your schema's foreign key constraints
    await db
      .delete(tables.users)
      .where(eq(tables.users.id, userId))
      .run();

    // Clear the user session
    await clearUserSession(event);

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  } catch (error) {
    // If it's already our thrown error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Account deletion error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete account. Please try again later.',
    });
  }
});
