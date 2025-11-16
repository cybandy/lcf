import { findUserByIdWithRoles, safeUserParsingWithRoles } from "../../utils/user"

export default defineEventHandler(async (event) => {
  const { user } = await myRequireUserSession(event)
  if (!user) {
    await clearUserSession(event)
    return sendRedirect(event, '/login')
  }

  const _u = await findUserByIdWithRoles(user.id)

  if (_u) {
    await updateUserSession(event, safeUserParsingWithRoles(_u))
    return sendNoContent(event)
  }

  await clearUserSession(event)
  return sendRedirect(event, '/login')

})
