<script setup lang='ts'>
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <div>
    <div v-if="page">
      <hero-slider
        v-if="page.hero"
        v-model="page.hero"
      />

      <UPageSection
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
      </UPageSection>

      <UPageSection
        :title="page.features.title"
        :description="page.features.description"
        :icon="page.features.icon"
        :orientation="page.features.orientation"
        :reverse="page.features.reverse"
      >
        <UPageGrid>
          <UPageCard
            v-for="({ image, ...item }, index) in page.features.items"
            :key="index"
            v-bind="{
              ...item,
              variant: item.variant || 'soft',
              reverse: item.reverse || true
            }"
          >
            <NuxtImg
              v-if="image"
              :src="image.src"
              :alt="image.alt"
            />
            <ImagePlaceholder v-else />
          </UPageCard>
        </UPageGrid>
      </UPageSection>

      <UPageSection
        id="testimonials"
        :headline="page.testimonials.headline"
        :title="page.testimonials.title"
        :description="page.testimonials.description"
      >
        <UMarquee
          pause-on-hover
          :repeat="10"
          :overlay="false"
          :ui="{ root: '[--gap:--spacing(4)]', content: 'w-auto py-1' }"
        >
          <UPageCard
            v-for="(testimonial, index) in page.testimonials.items"
            :key="index"
            :overlay="false"
            variant="subtle"
            :description="testimonial.quote"
            :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
            class="w-64 shrink-0"
          >
            <template #footer>
              <UUser
                v-bind="testimonial.user"
                size="lg"
              />
            </template>
          </UPageCard>
        </UMarquee>
        <!-- <UPageColumns class="xl:columns-4">
          <UPageCard
            v-for="(testimonial, index) in page.testimonials.items"
            :key="index"
            variant="subtle"
            :description="testimonial.quote"
            :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
          >
            <template #footer>
              <UUser
                v-bind="testimonial.user"
                size="lg"
              />
            </template>
          </UPageCard>
        </UPageColumns> -->
      </UPageSection>

      <USeparator />

      <UPageCTA
        v-bind="page.cta"
        variant="naked"
        class="overflow-hidden"
      >
      </UPageCTA>
    </div>

    <div v-else>
      loading
    </div>
  </div>
</template>
