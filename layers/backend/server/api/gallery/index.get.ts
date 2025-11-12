export default eventHandler(async () => {
  // this endpoint will be used to make the gallery accessible to the public

  const { blobs } = await hubBlob().list({
    limit: 1000,
    prefix: 'gallery/'
  })

  return blobs
})
