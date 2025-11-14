<script setup lang="ts">
import { useGallery } from '~/composables/useGallery'

const isOpen = ref(false)

const dropZoneRef = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const mansoryItem = ref<Array<HTMLElement>>([])
const deletingImg = ref('')
const uploadingImg = ref(false)
const disconnect = ref(false)

const toast = useToast()
const { uploadImage, deleteImage, getImages, files, isImage, isVideo } = useGallery()
const { loggedIn, clear } = useUserSession()

onBeforeMount(async () => {
  await getImages()
})

const active = useState('active-gallery-file')

const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)

function openFilePicker() {
  fileInput.value?.click()
}

async function fileSelection(event: Event) {
  const target = event.target as HTMLInputElement

  if (target.files?.[0]) {
    await uploadFile(target.files[0])
  }
}

async function onDrop(files: File[] | null) {
  await uploadFile(files)
}

async function uploadFile(file: File | File[] | null | undefined) {
  if (!file) return
  uploadingImg.value = true

  await uploadImage(file)
    .catch(() => toast.add({ title: 'An error occurred', description: 'Please try again', color: 'error' }))
    .finally(() => uploadingImg.value = false)
}

async function deleteFile(pathname: string) {
  deletingImg.value = pathname

  await deleteImage(pathname)
    .catch(() => toast.add({ title: 'An error occurred', description: 'Please try again', color: 'error' }))
    .finally(() => deletingImg.value = '')
}

async function clearSession() {
  disconnect.value = true

  await clear().finally(() => disconnect.value = false)
}
</script>

<template>
  <div>
    <section
      v-if="files && files.length"
      ref="dropZoneRef"
      class="relative h-screen gap-[22px] p-4"
    >
      <div
        class="w-full"
        :class="{ 'masonry-container': files && files.length }"
      >
        <UPageCard
          variant="outline"
          class="masonry-item"
        >
          <UFileUpload
            label="Drop your image here"
            description="SVG, PNG, JPG or GIF (max. 8MB)"
            class="w-full min-h-48"
            @update:model-value="uploadFile"
          />
        </UPageCard>
        <ul
          v-if="files && files.length"
          class="grid grid-cols-1 gap-4 lg:block"
        >
          <li
            v-for="file in files"
            ref="mansoryItem"
            :key="file.pathname"
            class="relative w-full group masonry-item"
          >
            <UButton
              v-if="loggedIn"
              :loading="deletingImg === file.pathname"
              color="neutral"
              icon="i-heroicons-trash-20-solid"
              class="absolute top-4 right-4 z-9999 opacity-0 group-hover:opacity-100"
              @click="deleteFile(file.pathname.split('/').join('-'))"
            />
            <NuxtLink
              :to="`/dashboard/${file.pathname.split('.')[0]}`"
              @click="active = file.pathname.split('.')[0]"
            >
              <img
                v-if="isImage(file)"
                width="527"
                height="430"
                :src="`/files/${file.pathname}`"
                :class="{ imageEl: file.pathname.split('.')[0] === active }"
                class="h-auto w-full max-h-[430px] rounded-md transition-all duration-200 border-file brightness-[.8] hover:brightness-100 will-change-[filter] object-cover"
              >
              <video
                v-else-if="isVideo(file)"
                :src="`/files/${file.pathname}`"
                class="h-auto w-full max-h-[430px] rounded-md transition-all duration-200 border-file brightness-[.8] hover:brightness-100 will-change-[filter] object-cover"
              />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>
    <div v-else>
      <UEmpty
        title="Gallery Empty"
        icon="i-lucide-image-off"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
@media (min-width: 768px) {
  .imageEl {
    view-transition-name: vtn-file;
  }

  .bottom-menu-description {
    view-transition-name: vtn-bottom-menu-description;
  }

  .bottom-menu-button {
    view-transition-name: vtn-bottom-menu-button;
  }

  .container-file {
    background-color: rgba(255, 255, 255, 0.1)
  }

  .container-file:hover {
    background-color: transparent;
  }

  .border-file {
    border-width: 1.15px;
    border-color: rgba(255, 255, 255, 0.1)
  }
}

@media screen and (min-width: 1024px) {
  .masonry-container {
    column-count: 3;
    column-gap: 20px;
    column-fill: balance;
    margin: 20px auto 0;
    padding: 2rem;
  }

  .masonry-item,
  .upload {
    display: inline-block;
    margin: 0 0 20px;
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
    width: 100%;
  }
}
</style>
