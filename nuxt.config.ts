// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ssr defaults to true. Previously set to false for a pure SPA build, but
  // that combination currently crashes `nuxt dev` due to a known upstream
  // regression in @nuxt/vite-builder (resolveServerEntry throws when
  // ssr:false — github.com/nuxt/nuxt/issues/35072). Using the default
  // (ssr:true) avoids that code path entirely and is also the standard,
  // best-tested way `nuxi generate` produces a static build.

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    // Disable the auto-redirect so we handle it ourselves in middleware
    redirect: false,
  },

  typescript: {
    strict: true,
    typeCheck: false, // Disable for faster builds; run tsc separately
  },

  nitro: {
    prerender: {
      // /admin/slots and /admin/buchungen are only reachable via
      // programmatic navigateTo() after login, not a static <NuxtLink>,
      // so the generate crawler won't discover them on its own — list
      // explicitly so `nuxi generate` still produces static HTML for them.
      routes: ['/', '/meine-buchungen', '/stornierung-bestaetigen', '/admin/login', '/admin/slots', '/admin/buchungen'],
    },
  },

  app: {
    head: {
      title: 'Sprechstunden-Tool | Prof. Krauss',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: '30-Minuten-Sprechstunden online buchen bei Prof. Dr. Christian Krauss.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  compatibilityDate: '2024-07-01',
})
