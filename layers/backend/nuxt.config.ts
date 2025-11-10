// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  $meta: {
    name: 'backend'
  },

  modules: ['@nuxthub/core', 'nuxt-auth-utils'],

  compatibilityDate: '2025-11-10',
})