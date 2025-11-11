import { useValidatedQuery, z } from 'h3-zod'
import { applyToGroup } from '#layers/backend/server/utils/group'

export default defineEventHandler(async (event) => {
  const { user } = await myRequireUserSession(event)
  const { group_id } = await useValidatedQuery(event, z.object({ group_id: z.string() }))

  if (!group_id) throw createError({ statusCode: 400, statusMessage: 'Group ID required' })

  await applyToGroup([{ userId: user.id, groupId: group_id }])

  return { success: true, message: 'Application submitted' }
})
