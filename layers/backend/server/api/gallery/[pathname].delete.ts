import { useValidatedParams, z } from 'h3-zod';
import { FellowshipPermission, hasFellowshipPermission } from '#layers/backend/shared/utils/authorization';
import { getUserWithRoles } from '#layers/backend/server/utils/authorization';

export default eventHandler(async (event) => {
  // Require authenticated user
  const session = await requireUserSession(event);
  
  let { pathname } = await useValidatedParams(
    event,
    z.object({
      pathname: z.string(),
    }),
  );

  pathname =  pathname.split('-').join('/').trim()

  // Get user with roles to check permissions
  const user = await getUserWithRoles(event);

  // Check if user has permission to delete gallery images
  // Either they need MANAGE_POSTS permission OR they should be the uploader
  const hasManagePermission = user && hasFellowshipPermission(user, FellowshipPermission.MANAGE_POSTS);
  
  // Check if the file belongs to the user (gallery files are prefixed with userId)
  // const userId = session.user?.id;
  // const isOwner = pathname.startsWith(`gallery/`);

  if (!hasManagePermission) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have permission to delete this image',
    });
  }

  await hubBlob().del(pathname);
  
  return sendNoContent(event)
});
