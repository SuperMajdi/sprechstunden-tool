<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Logo / brand -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-slate-800">Admin-Login</h1>
        <p class="text-sm text-slate-500 mt-1">Sprechstunden-Tool</p>
      </div>

      <!-- Login form -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form class="space-y-4" novalidate @submit.prevent="login">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              placeholder="admin@example.com"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              :disabled="loading"
              aria-required="true"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              :disabled="loading"
              aria-required="true"
            />
          </div>

          <div
            v-if="error"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || !email || !password"
            class="w-full bg-navy-700 text-white font-semibold py-2.5 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? 'Anmelden …' : 'Anmelden' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-slate-400 mt-6">
        <NuxtLink to="/" class="hover:text-slate-600 underline">← Zurück zur Buchungsseite</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'admin' })

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function login(): Promise<void> {
  error.value = null
  loading.value = true
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })
  loading.value = false
  if (err) {
    error.value = 'E-Mail oder Passwort ist falsch.'
    return
  }
  await navigateTo('/admin/slots')
}
</script>
