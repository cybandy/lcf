<script lang="ts" setup>
const { data: page } = await useAsyncData('contact', () => queryCollection('contact').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

// api in misc plugin
const c_d = computed(() => useNuxtData('contact_details').data.value)
</script>

<template>
  <div>
    <div v-if="page">
      <u-page-hero v-bind="page.hero">
        <u-page-grid class="sm:grid-cols-1 lg:grid-cols-2">
          <u-page-card variant="subtle">
            <template #header>
              <p class="text-lg sm:text-2xl lg:text-3xl">
                Send a Message
              </p>
            </template>
            <contact-form />
          </u-page-card>
          <u-card class="ring-0 divide-x-0 divide-y-0">
            <template #header>
              <p class="text-lg sm:text-2xl lg:text-3xl">
                Contact Links
              </p>
            </template>
            <u-card>
              <template #header>
                <div class="grid gap-2">
                  <p class="flex gap-2 items-center">
                    <u-icon
                      name="i-lucide-phone"
                      class="size-4"
                    />
                    <span class="text-sm">Call</span>
                  </p>
                  <u-button
                    variant="ghost"
                    color="neutral"
                    :label="c_d.phone"
                    :to="`tel:${c_d.phone}`"
                    target="_blank"
                  />
                </div>
              </template>
              <div class="grid gap-2">
                <p class="flex gap-2 items-center">
                  <u-icon
                    name="i-lucide-mail"
                    class="size-4"
                  />
                  <span class="text-sm">Email</span>
                </p>
                <u-button
                  variant="ghost"
                  color="neutral"
                  :label="c_d.email"
                  :to="`mailto:${c_d.email}`"
                  target="_blank"
                />
              </div>
              <template #footer>
                <div class="grid gap-2">
                  <p class="flex gap-2 items-center">
                    <u-icon
                      name="i-lucide-message-circle-more"
                      class="size-4"
                    />
                    <span class="text-sm">Socials</span>
                  </p>
                  <div class="flex items-center gap-1">
                    <u-button
                      variant="ghost"
                      color="neutral"
                      :to="c_d.social_media.instagram"
                      target="_blank"
                      icon="i-simple-icons-instagram"
                    />
                    <u-button
                      variant="ghost"
                      color="neutral"
                      target="_blank"
                      :to="c_d.social_media.facebook"
                      icon="i-simple-icons-facebook"
                    />
                    <u-button
                      variant="ghost"
                      color="neutral"
                      target="_blank"
                      :to="c_d.social_media.x"
                      icon="i-simple-icons-x"
                    />
                    <u-button
                      variant="ghost"
                      color="neutral"
                      target="_blank"
                      :to="c_d.social_media.youtube"
                      icon="i-simple-icons-youtube"
                    />
                  </div>
                </div>
              </template>
            </u-card>
          </u-card>
        </u-page-grid>
      </u-page-hero>
    </div>
  </div>
</template>
