<template>
  <div class="min-h-screen bg-slate-100 flex flex-col">
    <!-- ── Top bar ───────────────────────────────────────────── -->
    <header class="bg-navy-800 text-white shadow-md">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <span class="font-semibold text-sm">Admin — Sprechstunden-Tool</span>
        </div>

        <button
          class="text-xs text-navy-100 hover:text-white transition-colors flex items-center gap-1.5"
          @click="logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Abmelden
        </button>
      </div>
    </header>

    <div class="flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-6">
      <!-- ── Sidebar ─────────────────────────────────────────── -->
      <nav class="w-44 flex-shrink-0 hidden sm:block">
        <ul class="space-y-1">
          <li>
            <NuxtLink
              to="/admin/slots"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              active-class="bg-navy-700 text-white"
              inactive-class="text-slate-600 hover:bg-white hover:text-navy-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Zeitslots
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/admin/buchungen"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              active-class="bg-navy-700 text-white"
              inactive-class="text-slate-600 hover:bg-white hover:text-navy-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Buchungen
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- ── Content ────────────────────────────────────────── -->
      <main class="flex-1 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

async function logout(): Promise<void> {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>
