import { z, useSafeValidatedQuery } from 'h3-zod'

export default defineEventHandler(async (event) => {
  const _error = createError({
    statusCode: 401,
    statusMessage: 'Unauthorized'
  })
  try {
    const { user } = await myRequireUserSession(event)
    if (!isAdmin(user)) {
      throw _error
    }
  } catch (error) {
    const parse = await useSafeValidatedQuery(event, z.object({
      api_key: z.string()
    }))

    if (!parse.success) {
      throw _error
    }

    const _k = useRuntimeConfig(event).seed

    if (_k !== parse.data.api_key) {
      throw _error
    }
  }

  const payload = { ...getQuery(event) };
  const { result } = await runTask("db:seed", { payload });

  return { result };
})
