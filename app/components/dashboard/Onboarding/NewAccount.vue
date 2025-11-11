<script lang="ts" setup>
const items = ref([
  {
    title: 'Profile',
    description: 'Upload a profile picture',
    slot: 'profile',
    icon: 'i-lucide-user',
  },
  {
    title: 'Personal',
    description: 'Add your personal information',
    slot: 'personal',
    icon: 'i-qb-user-data',
  },
  {
    title: 'Volunteer',
    description: 'Join groups and serve among believers',
    slot: 'volunteer',
    icon: 'i-lucide-user-round-cog',
  },
])

const stepper = useTemplateRef('stepper')
const toast = useToast()

const { user, loggedIn, fetch } = useMyUserSession()

// Ensure user is logged in
onMounted(async () => {
  if (!loggedIn.value) {
    await fetch()

    if (!loggedIn.value) {
      navigateTo('/login')
    }
  }
})

// Personal information step
const personalLoading = ref(false)

async function updatePersonalInformation(body: Record<string, unknown>) {
  personalLoading.value = true
  try {
    await $fetch('/api/user', {
      method: 'PATCH',
      body,
    })

    await fetch()

    toast.add({
      title: 'Success',
      description: 'Personal information updated successfully',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })

    if (stepper.value?.hasNext) {
      stepper.value.next()
    } else {
      navigateTo('/dashboard')
    }
  } catch (error) {
    const err = error as {
      data?: { statusMessage?: string }
      message?: string
    }
    toast.add({
      title: 'Error',
      description: err?.data?.statusMessage || 'Failed to update information',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    personalLoading.value = false
  }
}

// Volunteer groups step
const volunteerGroups = ref([] as number[])
const volunteerLoading = ref(false)

async function updateGroupVolunteer() {
  // Allow skipping this step
  if (!volunteerGroups.value.length) {
    if (stepper.value?.hasNext) {
      stepper.value.next()
    } else {
      navigateTo('/dashboard')
    }
    return
  }

  volunteerLoading.value = true
  try {
    const response = await $fetch('/api/group/applications', {
      method: 'POST',
      body: volunteerGroups.value,
    })

    if (response.success) {
      toast.add({
        title: 'Success',
        description: response.message,
        color: 'success',
        icon: 'i-heroicons-check-circle',
      })

      if (stepper.value?.hasNext) {
        stepper.value.next()
      } else {
        navigateTo('/dashboard')
      }
    }
  } catch (error) {
    const err = error as {
      data?: { statusMessage?: string }
      message?: string
    }
    toast.add({
      title: 'Error',
      description: err?.data?.statusMessage || 'Failed to submit applications',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    volunteerLoading.value = false
  }
}

// Profile picture step
const profileFile = ref<File>()
const profileLoading = ref(false)
const upload = useUpload('/api/user/profile/picture-upload', { method: 'PUT' })

const _name = computed(
  () => `${user.value?.firstName || ''} ${user.value?.lastName || ''}`.trim(),
)

async function onFileUpload(f: File) {
  profileLoading.value = true
  try {
    await upload(f)

    await fetch()

    toast.add({
      title: 'Success',
      description: 'Profile picture uploaded successfully',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })

    if (stepper.value?.hasNext) {
      stepper.value.next()
    } else {
      navigateTo('/dashboard')
    }
  } catch (error) {
    const err = error as {
      data?: { statusMessage?: string }
      message?: string
    }
    toast.add({
      title: 'Error',
      description: err?.data?.statusMessage || 'Failed to upload image',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    profileLoading.value = false
  }
}

// Navigation functions
function skipToDashboard() {
  navigateTo('/dashboard')
}

function skipToNext() {
  if (stepper.value && stepper.value.hasNext) {
    stepper.value.next()
  }
}
</script>

<template>
  <div class="w-full">
    <u-stepper
      ref="stepper"
      :items
    >
      <template #profile>
        <div class="flex flex-col items-center">
          <div class="py-4 min-w-2/3">
            <p class="text-lg">
              Profile Picture
            </p>
            <p class="text-muted text-xs">
              UPload a profile picture below (optional)
            </p>
          </div>
          <div class="min-w-full flex justify-center">
            <dashboard-profile-upload-picture
              v-model:file="profileFile"
              :alt="_name"
              :src="user?.avatar!"
              :is-skip="stepper?.hasNext"
              @skip="skipToNext"
              @submit="onFileUpload"
            />
          </div>
        </div>
      </template>
    
      <template #personal>
        <div class="flex flex-col items-center">
          <div class="py-4 min-w-2/3">
            <p class="text-lg">
              Personal Information
            </p>
            <p class="text-muted text-xs">
              Enter your personal information below
            </p>
          </div>
          <div class="min-w-full flex justify-center">
            <forms-personal-information
              v-model="user!"
              :loading="personalLoading"
              :is-skip="stepper?.hasNext"
              class="min-w-2/3"
              @submit="updatePersonalInformation"
              @skip="skipToNext"
            />
          </div>
        </div>
      </template>

      <template #volunteer>
        <div class="flex flex-col items-center">
          <div class="py-4 min-w-full">
            <p class="text-lg">
              Volunteer
            </p>
            <p class="text-muted text-xs">
              Join one or more groups - this step is optional
            </p>
          </div>
          <div class="min-w-full flex justify-center">
            <dashboard-group-volunteer
              v-model="volunteerGroups"
              :loading="volunteerLoading"
              :is-skip="true"
              class=""
              @submit="updateGroupVolunteer"
              @skip="skipToDashboard"
            />
          </div>
        </div>
      </template>
    </u-stepper>

    <!-- <div class="flex gap-2 justify-between items-center mt-4">
      <u-button
        leading-icon="i-lucide-arrow-left"
        :disabled="!stepper?.hasPrev"
        label="Prev"
        @click="stepper?.prev"
      />
      <div class="flex gap-2">
        <u-button
          v-if="!stepper?.hasNext"
          variant="ghost"
          label="Skip to Dashboard"
          @click="skipToDashboard"
        />
        <u-button
          v-else
          trailing-icon="i-lucide-arrow-right"
          :label="!stepper?.hasNext ? 'Dashboard' : 'Next'"
          @click="nextStep"
        />
      </div>
    </div> -->
  </div>
</template>

<style scoped></style>
