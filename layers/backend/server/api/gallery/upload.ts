export default eventHandler(async (event) => {
  const session = await requireUserSession(event);
  
  // @ts-expect-error - Session user has id property
  const userId = session.user?.id;

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - User ID not found in session',
    });
  }

  // https://hub.nuxt.com/docs/storage/blob#handleupload
  return hubBlob().handleUpload(event, {
    multiple: false,
    put: {
      addRandomSuffix: true,
      prefix: `gallery/${userId}/`, // Add userId prefix for ownership tracking
    },
    ensure: {
      maxSize: '8MB',
      types: ['image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/webp']
    }
  })
})
