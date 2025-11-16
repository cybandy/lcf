import { useValidatedBody, useValidatedQuery, z } from "h3-zod";
import { FellowshipPermission, hasFellowshipPermission } from '~~/shared/utils/authorization';
import { getUserWithRoles } from '~~/server/utils/authorization';

export default defineEventHandler(async (event) => {

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
          statusMessage: 'You do not have permission to delete',
        });
      }

    const {pathnames } = await useValidatedBody(event, z.object({
        pathnames: z.preprocess((val: string | string[]) => { 
            if (typeof val === 'string') {
                return val.trim().split(',')
            }
        }, z.array(z.string()))
    }))

    await hubBlob().del(pathnames)

    return sendNoContent(event)

})