interface BlobObject {
  pathname: string
  contentType: string | undefined
  size: number
  httpEtag: string
  uploadedAt: Date
  httpMetadata: Record<string, string>
  customMetadata: Record<string, string> & { userId?: string }
}

export const useGallery = () => {
  // state
  const files = ref<BlobObject[]>()
  const router = useRouter()
  const toast = useToast()

  /**
   * Fetch
   */
  // https://hub.nuxt.com/docs/storage/blob#useupload
  const upload = useUpload('/api/gallery/upload', { multiple: false })
  
  async function getImages() {
    const file = await $fetch('/api/gallery', {
      method: 'get'
    })

    files.value = file.map(x => ({
      ...x,
      uploadedAt: new Date(x.uploadedAt),
    }))
  }

  async function uploadImage(image: File | File[], filter: boolean = false) {
    try {
      await upload(image).catch(err => toast.add({
        color: 'error',
        title: 'Failed to upload image',
        description: err.data?.message || err.message
      }))
      toast.add({
        title: 'File Uploaded',
        color: 'success'
      })
      getImages()

      if (filter) {
        router.push('/')
      }
    } catch (error) {
      toast.add({ title: 'Oops!!!', description: 'An error occurred try again later', color: 'error' })
    }
  }

  async function deleteImage(pathname: string) {
    await $fetch(`/api/gallery/${pathname}`, { method: 'DELETE' })

    getImages()
  }

  // methods
  function isVideo(file: BlobObject) {
    return file.contentType ? file.contentType.includes('video') : false
  }

  function isImage(file: BlobObject) {
    return file.contentType ? file.contentType.includes('image') : false
  }

  return {
    getImages,
    files,
    uploadImage,
    deleteImage,
    isImage,
    isVideo
  }
}
