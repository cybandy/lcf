import { FellowshipPermission, hasFellowshipPermission } from '#layers/backend/shared/utils/authorization';
import { getUserWithRoles } from '#layers/backend/server/utils/authorization';

export default eventHandler(async (event) => {
  await myRequireUserSession(event);
  const user = await getUserWithRoles(event);
  // if (!user) {
  //   throw createError({statusCode:401, statusMessage: 'Not logged in'})
  // }
  const userId = user?.id;

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - User ID not found in session',
    });
  }

  // check if user has permission to upload gallery images
  const hasManagePermission = user && hasFellowshipPermission(user, FellowshipPermission.MANAGE_POSTS)

   if (!hasManagePermission) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have permission to upload',
    });
  }

  // https://hub.nuxt.com/docs/storage/blob#handleupload
  return hubBlob().handleUpload(event, {
    multiple: true,
    put: {
      addRandomSuffix: true,
      prefix: `gallery/`, // Add userId prefix for ownership tracking
      customMetadata: {
        userId
      }
    },
    ensure: {
      maxSize: '8MB',
      types: ['image', 'video']
    }
  })
})
