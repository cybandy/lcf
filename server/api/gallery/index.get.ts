export default eventHandler(async () => {
  // return Array.from(Array(200).keys()).map(i => `https://picsum.photos/id/${i}/800/640`)

  const { blobs } = await hubBlob().list({
    limit: 1000,
    prefix: 'gallery/'
  })

  return blobs
})
