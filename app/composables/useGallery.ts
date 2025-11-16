export interface BlobObject {
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
  const loading = ref(false)

  // authorization
  const permission = usePermissions()
  
  const isAuthorizedGallery = computed(() => permission.canPerform('delete', 'gallery')
  )

  /**
   * Fetch
   */
  // https://hub.nuxt.com/docs/storage/blob#useupload
  const upload = useUpload('/api/gallery/upload', { multiple: true })
  
  async function getImages() {
    loading.value = true
    const file = await $fetch('/api/gallery', {
      method: 'get'
    })

    files.value = file.map(x => ({
      ...x,
      uploadedAt: new Date(x.uploadedAt),
    }))
    loading.value = false
  }

  async function uploadImage(image: File[], filter: boolean = false) {
    if (!isAuthorizedGallery.value) return
    try {
      await upload(image)
        .catch(err => toast.add({
          color: 'error',
          title: 'Failed to upload image',
          description: err.data?.message || err.message
        }))
        .then(() => {
          toast.add({
            title: 'File Uploaded',
            color: 'success'
          })
        })
      
      getImages()

      if (filter) {
        router.push('/')
      }
    } catch (error) {
      // toast.add({ title: 'Oops!!!', description: 'An error occurred try again later', color: 'error' })
    }
  }

  async function deleteImage(pathnames: string | string[]) {
    if (!isAuthorizedGallery.value) return
    await $fetch(`/api/gallery`, { method: 'DELETE', body: { pathnames } })

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
    isVideo,
    isAuthorizedGallery,
    loading
  }
}
