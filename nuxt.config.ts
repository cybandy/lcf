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
    // 'nuxt-security'
  ],

  devtools: {
    enabled: true
  },

  runtimeConfig: {
    seed: process.env.SEED_DB_API_KEY || 'dev'
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  extends: [
    // 'github:danielkellyio/nuxt-email-layer/layer'
  ],

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
  },

  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },

  image: {
    provider: 'none'
  },

  nitro: {
    experimental: {
      tasks: true,
      // websocket: true,
      openAPI: true
    }
  },

  // security: {
  //   headers: {
  //     crossOriginResourcePolicy: import.meta.dev ? 'cross-origin' : "same-origin",
  //     contentSecurityPolicy: import.meta.dev ? false : {}
  //   },
    
  // }
})
