<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- ── Header ──────────────────────────────────────────────── -->
    <header class="bg-navy-700 text-white shadow-lg">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div class="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <div class="font-semibold text-base leading-tight">{{ t('brand.title') }}</div>
            <div class="text-navy-100 text-xs leading-tight opacity-80">Prof. Dr. Christian Krauss</div>
          </div>
        </NuxtLink>

        <nav class="flex items-center gap-3 sm:gap-4">
          <div
            class="inline-flex rounded-lg border border-white/20 bg-navy-800/30 p-0.5"
            role="group"
            :aria-label="t('language.label')"
          >
            <button
              type="button"
              :class="languageOptionClass('de')"
              :aria-pressed="language === 'de'"
              :title="t('language.de')"
              @click="setLanguage('de')"
            >
              DE
            </button>
            <button
              type="button"
              :class="languageOptionClass('en')"
              :aria-pressed="language === 'en'"
              :title="t('language.en')"
              @click="setLanguage('en')"
            >
              EN
            </button>
          </div>

          <NuxtLink
            to="/meine-buchungen"
            class="text-sm text-navy-100 hover:text-white transition-colors hidden sm:block"
          >
            {{ t('nav.myBookings') }}
          </NuxtLink>
          <NuxtLink
            to="/meine-buchungen"
            class="sm:hidden text-navy-100 hover:text-white"
            :aria-label="t('nav.myBookings')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- ── Main Content ────────────────────────────────────────── -->
    <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <slot />
    </main>

    <!-- ── Footer ──────────────────────────────────────────────── -->
    <footer class="border-t border-slate-200 bg-white mt-auto">
      <div class="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <span>{{ t('footer.institute') }}</span>
        <NuxtLink to="/admin/login" class="hover:text-navy-700 transition-colors">
          {{ t('footer.admin') }}
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { AppLanguage } from '~/composables/useLanguage'

const { language, setLanguage, t } = useLanguage()

function languageOptionClass(option: AppLanguage): string {
  const base = 'px-2 py-1 rounded-md text-xs font-semibold transition-colors'
  return language.value === option
    ? `${base} bg-white text-navy-700`
    : `${base} text-navy-100 hover:text-white`
}
</script>
