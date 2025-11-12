<script setup lang="ts">
  const { data: page } = await useAsyncData('dev', () =>
    queryCollection('dev').first(),
  );

  const title = page.value?.seo?.title || page.value?.title;
  const description = page.value?.seo?.description || page.value?.description;

  useSeoMeta({
    titleTemplate: '',
    title,
    ogTitle: title,
    description,
    ogDescription: description,
  });
</script>

<template>
  <div v-if="page">
    <hero-slider v-if="page.hero" v-model="page.hero" />
  </div>

  <div v-else>empty</div>
  <!-- <u-page-card class="col-span-full lg:col-span-8">
    <div class="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
      <div class="flex items-center gap-3 mb-4">
        <UIcon name="i-heroicons-user" class="size-6 text-primary" />
        <div>
          <h3 class="text-lg font-semibold">Personal Information</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Update your personal details
          </p>
        </div>
      </div>
      <forms-personal-information
        v-if="_user"
        v-model="_user"
        :loading="personalLoading"
        @submit="onPersonalInfoUpdate"
      />
    </div>

    <div>
      <div class="flex items-center gap-3 mb-4">
        <UIcon name="i-heroicons-photo" class="size-6 text-primary" />
        <div>
          <h3 class="text-lg font-semibold">Profile Picture</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Change your avatar
          </p>
        </div>
      </div>
      <div class="flex flex-col items-center">
        <dashboard-profile-upload-picture
          v-model:file="profileFile"
          :alt="fullName"
          :src="user?.avatar || undefined"
          :loading="avatarLoading"
          @submit="onAvatarUpload"
        />
      </div>
    </div>
  </u-page-card> -->
</template>
