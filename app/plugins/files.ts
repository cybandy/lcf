import type { FilePlugin } from '~/utils/types'

export default defineNuxtPlugin(() => {
  const images = ref()
  const router = useRouter()
  const toast = useToast()
  // https://hub.nuxt.com/docs/storage/blob#useupload
  const upload = useUpload('/api/gallery/upload', { multiple: false })

  async function getImages() {
    const file = await $fetch('/api/gallery', {
      method: 'get'
    })

    images.value = file
  }

  async function uploadImage(image: File, filter: boolean = false) {
    await upload(image).catch(err => toast.add({
      color: 'error',
      title: 'Failed to upload image',
      description: err.data?.message || err.message
    }))

    getImages()

    if (filter) {
      router.push('/')
    }
  }

  async function deleteImage(pathname: string) {
    await $fetch(`/api/gallery/${pathname}`, { method: 'DELETE' })

    getImages()
  }

  return {
    provide: {
      file: {
        getImages,
        images,
        uploadImage,
        deleteImage
      } as FilePlugin
    }
  }
})
