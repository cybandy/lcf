<script setup lang='ts'>
const { data: page } = await useAsyncData('about', () => queryCollection('about').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

const gallery = [
  'https://picsum.photos/640/640?random=1',
  'https://picsum.photos/640/640?random=2',
  'https://picsum.photos/640/640?random=3',
  'https://picsum.photos/640/640?random=4',
  'https://picsum.photos/640/640?random=5',
  'https://picsum.photos/640/640?random=6'
]

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
type V = {
  quote: string
  reference: string
  source?: {
    url: string
    target?: string | undefined
  }
}
const _verse = ref<V>()
</script>

<template>
  <div>
    <div v-if="page">
      <UPageHero
        :title="page.hero.title"
        :description="page.hero.description"
        :links="page.hero.links"
        :orientation="page.hero.orientation"
        :reverse="page.hero.reverse"
        :headline="page.hero.headline"
        :class="page.hero.class"
      >
        <template #title>
          <Motion
        
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.1
            }"
            :while-in-view="{
              opacity: 1
            }"
          >
            <MDC
              :value="page.hero.title"
              unwrap="p"
              class=""
            />
          </Motion>
        </template>

        <template #headline>
          <Motion 
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.3
            }"
          >
            <span v-if="page.hero.headline">{{ page.hero.headline }}</span>
            <UIcon
              v-else-if="page.hero.icon"
              :name="page.hero.icon"
              class="shrink-0 text-primary size-10"
            />
          </Motion>
        </template>

        <template #description>
          <Motion 
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.3
            }"
          >
            <p>{{ page.hero.description }}</p>
          </Motion>
        </template>

        <template #links>
          <Motion 
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.6,
              delay: 0.3
            }"
            class="flex flex-wrap gap-x-6 gap-y-3"
          >
            <u-button
              v-for="(button, ind) of page.hero.links"
              :key="ind"
              v-bind="button"
            />
          </Motion>
        </template>

        <NuxtImg
          :src="page.hero.image.src"
          :alt="page.hero.image.alt"
          class="w-full"
        />
      </UPageHero>

      <motion-page-section
        v-for="(section, index) in page.sections"
        :key="index"
        :title="section.title"
        :description="section.description"
        :orientation="section.orientation"
        :reverse="section.reverse"
        :features="section.features"
        :links="section.links"
      >
        <ImagePlaceholder />
      </motion-page-section>

      <motion-page-section
        :title="page.features.title"
        :description="page.features.description"
        :icon="page.features.icon"
        :orientation="page.features.orientation"
        :reverse="page.features.reverse"
      >
        <UPageColumns>
          <UPageCard
            v-for="(pic, ind) of gallery"
            :key="ind"
          >
            <NuxtImg :src="pic" />
          </UPageCard>
        </UPageColumns>
      </motion-page-section>

      <UCarousel
        v-slot="{ item: verse }"
        :items="page.verses"
        :autoplay="{
          stopOnMouseEnter: true,
          stopOnInteraction: false,
          delay: 3000
        }"
        loop
        class="-ms-0"
        :ui="{ container: 'h-full' }"
      >
        <UPageCTA
          :description="verse.quote"
          variant="subtle"
          :links="[{ label: verse.reference, to: verse.source?.url, target: '_blank' }]"
          class="h-full"
        />
      </UCarousel>
    </div>

    <div v-else>
      loading
    </div>
  </div>
</template>
