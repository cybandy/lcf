export default defineEventHandler(async (event) => {
  const { user } = await myRequireUserSession(event)
  return await listAllGroups()
})
