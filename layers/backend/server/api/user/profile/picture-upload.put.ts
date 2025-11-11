export default defineEventHandler(async (event) => {
  // Require authenticated user
  const session = await myRequireUserSession(event);
  const userId = session.user.id;

  // Handle file upload with validation
  const [uploadedFile] = await hubBlob().handleUpload(event, {
    multiple: false,
    ensure: {
      maxSize: '8MB',
      types: ['image/jpeg', 'image/png', 'image/webp'],
    },
    put: {
      addRandomSuffix: true,
      prefix: `avatars/${userId}/`,
    },
  });

  if (!uploadedFile?.pathname) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to upload image',
    });
  }

  const pathname = uploadedFile.pathname;

  try {
    // Get current user to check for old avatar
    const currentUser = await findUserById(userId);
    
    if (!currentUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    // Delete old avatar if it exists and is not a default/external URL
    if (currentUser.avatar && currentUser.avatar.startsWith('avatars/')) {
      try {
        await deleteAvatar(currentUser.avatar);
      } catch (error) {
        // Log but don't fail the request if old avatar deletion fails
        console.error('Failed to delete old avatar:', error);
      }
    }

    // Update user with new avatar
    const updatedUser = await updateUser(userId, {
      avatar: pathname,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Failed to update user avatar',
      });
    }

    // Update session with new avatar
    const { password, githubToken, googleToken, ...safeUser } = updatedUser;
    await updateUserSession(event, safeUser);

    return {
      success: true,
      message: 'Profile picture updated successfully',
      avatar: pathname,
    };
  } catch (error) {
    // If upload succeeded but update failed, try to clean up the uploaded file
    try {
      await hubBlob().delete(pathname);
    } catch (cleanupError) {
      console.error('Failed to cleanup uploaded file:', cleanupError);
    }

    // If it's already our thrown error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Avatar update error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile picture. Please try again later.',
    });
  }
});
