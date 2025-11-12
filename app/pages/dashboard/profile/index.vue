<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

useSeoMeta({
  title: 'Profile',
  description: 'Manage your profile information',
});

const { user, fetch: fetchUser } = useMyUserSession();

const _user = ref<User>();

onMounted(() => {
  _user.value = {
    ...user.value,
    dob: user.value.dob ? new Date(user.value.dob) : null
  }
})
watch(user, () => {
  _user.value = {
    ...user.value,
    dob: user.value.dob ? new Date(user.value.dob) : null
  }
})

const toast = useToast();

// Avatar upload
const profileFile = ref<File>();
const avatarLoading = ref(false);
const upload = useUpload('/api/user/profile/picture-upload', {
  method: 'PUT',
});

const fullName = computed(() =>
  `${user.value?.firstName || ''} ${user.value?.lastName || ''}`.trim(),
);

async function onAvatarUpload(file: File) {
  avatarLoading.value = true;
  try {
    await upload(file);
    await fetchUser();

    toast.add({
      title: 'Success',
      description: 'Profile picture updated successfully',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });

    editOpen.value = !editOpen.value
  } catch (error) {
    const err = error as {
      data?: { statusMessage?: string }
      message?: string
    };
    toast.add({
      title: 'Upload failed',
      description: err?.data?.statusMessage || 'Failed to upload image',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    });
  } finally {
    avatarLoading.value = false;
  }
}

// Personal information
const personalLoading = ref(false);

async function onPersonalInfoUpdate(data: Record<string, unknown>) {
  personalLoading.value = true;
  try {
    await $fetch('/api/user', {
      method: 'PATCH',
      body: data,
    });

    await fetchUser();

    toast.add({
      title: 'Success',
      description: 'Profile updated successfully',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });
  } catch (error) {
    const err = error as {
      data?: { statusMessage?: string }
      message?: string
    };
    toast.add({
      title: 'Update failed',
      description: err?.data?.statusMessage || 'Failed to update profile',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    });
  } finally {
    personalLoading.value = false;
  }
}

const editOpen = ref(false);
const menu = ref<DropdownMenuItem[][]>([
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect: () => {
        if (!user.value) return;
        _user.value = {
          ...user.value,
          dob: user.value.dob ? new Date(user.value.dob) : null,
        };
        editOpen.value = true;
      },
    },
  ],
]);
</script>

<template>
  <div class="grid gap-8">
    <UPageCard
      variant="outline"
      orientation="vertical"
      title="Personal Information"
      :ui="{
        wrapper: '',
        root: 'relative'
      }"
    >
      <UDropdownMenu
        :items="menu"
        class="absolute top-2.5 right-2.5"
      >
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
        />
      </UDropdownMenu>
      <div class="w-full flex flex-col items-center text-center">
        <UAvatar
          :src="user.avatar || undefined"
          :alt="fullName"
          class="size-28 md:size-48"
        />
        <div class="pt-5 space-y-1">
          <p class="text-lg sm:text-xl md:text-2xl">
            {{ fullName }}
          </p>
          <p class="text-sm text-dimmed">
            {{ user.email }}
          </p>

          <UBadge
            v-if="user?.status"
            :label="user.status"
            :color="user.status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
            class="mt-2"
          />
        </div>
      </div>
    </UPageCard>

    <FormsPersonalInformation
      v-model="_user"
      variant="subtle"
      @submit="onPersonalInfoUpdate"
    />

    <UPageCard
      title="Account Security"
      description="No longer want to use the platform? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
      class="bg-linear-to-tl from-error/10 from-5% to-default"
    >
      <template #footer>
        <UButton
          label="Delete account"
          color="error"
        />
      </template>
    </UPageCard>

    <UModal
      v-model:open="editOpen"
      title="Upload a picture"
      description=""
    >
      <template #body>
        <dashboard-profile-upload-picture
          v-model:file="profileFile"
          :alt="_name"
          :src="user?.avatar!"
          class="w-full"
          @submit="onAvatarUpload"
        />
      </template>
    </UModal>
  </div>
</template>

<style scoped>

</style>
