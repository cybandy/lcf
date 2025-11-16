export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:beforeMount', () => {
    useAsyncData('misc_refresh', async () => {
      if (!useMyUserSession().loggedIn) return
      await $fetch('/api/auth/refresh')
      await useMyUserSession().fetch()
    })
  })
})
