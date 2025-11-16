<script lang="ts" setup>
type Props = {
  active: { title: string, index: number }
}
const props = withDefaults(defineProps<Props>(), {})
const emits = defineEmits(['update:title', 'update:index'])

const { active } = useVModels(props, emits)

const { getImages, isImage, isVideo, isAuthorizedGallery, files } = useGallery()

await getImages()

// modal
// const galleryOpen = ref(false)
const carousel = useTemplateRef('carousel')
const onClickPrev = () => {
  active.value.index--
}
const onClickNext = () => {
  active.value.index++
}
const onSelectCarousel = (index: number) => {
  active.value.index = index
}
const onSelectCarouselItem = (index: number) => {
  active.value.index = index
  carousel.value?.emblaApi?.scrollTo(index)
}

onMounted(() => {
  onSelectCarouselItem(active.value.index)
})
</script>

<template>
  <div>
    <UContainer class="flex flex-col items-center max-h-screen max-w-dvw">
      <div class="w-full sm:min-w-5/6 md:w-2/3 h-full">
        <UCarousel
          v-slot="{ item: file }"
          ref="carousel"
          :items="files"
          arrows
          :prev="{ onClick: onClickPrev }"
          :next="{ onClick: onClickNext }"
          class="w-full mx-auto car"
          :ui="{
            container: '',
            item: 'h-full'
          }"
          @select="onSelectCarousel"
        >
          <UPageCard
            variant="naked"
          >
            <div class="relative overflow-hidden rounded-sm opacity-75 px-4 flex items-center justify-center aspect-video">
              <div class="absolute inset-0 h-full w-full">
                <gallery-element :file="file" />
              </div>
            </div>
          </UPageCard>
        </UCarousel>

        <div class="flex gap-1 justify-between pt-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto">
          <div
            v-for="(file, index) in files"
            :key="index"
            class="size-11 opacity-25 hover:opacity-100 transition-opacity"
            :class="{ 'opacity-100': active.index===index }"
            @click="() => onSelectCarouselItem(index)"
          >
            <img
              v-if="isImage(file)"
              width="44"
              height="44"
              :src="`/files/${file.pathname}`"
              :class="{ imageEl: file.pathname.split('.')[0] === active.title }"
              class="rounded-lg"
            >
            <video
              v-else-if="isVideo(file)"
              width="44"
              height="44"
              :src="`/files/${file.pathname}`"
              class="rounded-lg"
              :controls="false"
              :disable-picture-in-picture="true"
              preload="none"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<style scoped>

</style>
