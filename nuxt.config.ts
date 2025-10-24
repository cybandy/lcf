// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/scripts',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    '@nuxthub/core',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate',
    '@nuxt/image',
    'motion-v/nuxt',
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  hub: {
    database: true,
    blob: true
  },

  icon: {
    customCollections: [
      {
        prefix: 'qb',
        dir: './app/assets/icons'
      }
    ]
  }
})
