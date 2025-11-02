export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:beforeMount', async () => {
    const d = await useAsyncData('contact_details', () => queryCollection('contact_details').first())
      
    // nuxtApp.provide('contact_details', d)
  })
})
