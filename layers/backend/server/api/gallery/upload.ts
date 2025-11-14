export default eventHandler(async (event) => {
  const {user} = await myRequireUserSession(event);
  const userId = user.id;

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
      prefix: `gallery/`, // Add userId prefix for ownership tracking
      customMetadata: {
        userId
      }
    },
    ensure: {
      maxSize: '8MB',
      types: ['image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/webp']
    }
  })
})
