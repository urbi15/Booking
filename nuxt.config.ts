export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxtjs/supabase',
  ],
  devtools: {
    enabled: true,
  },
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: { stylistic: true },
  },
  supabase: {
    redirect: false,
  },
})
