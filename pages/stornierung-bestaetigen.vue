<template>
  <div class="max-w-xl mx-auto">
    <div class="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        :class="state === 'success' ? 'bg-emerald-100 text-emerald-600' : state === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'"
      >
        <svg v-if="state === 'loading'" class="animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else-if="state === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 class="text-xl font-bold text-slate-800">
        {{ title }}
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        {{ text }}
      </p>

      <div v-if="state !== 'loading'" class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink
          to="/"
          class="rounded-lg bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-colors"
        >
          {{ t('cancelConfirm.homeLink') }}
        </NuxtLink>
        <NuxtLink
          to="/meine-buchungen"
          class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {{ t('cancelConfirm.myBookingsLink') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ConfirmationState = 'loading' | 'success' | 'error'

const route = useRoute()
const supabase = useSupabaseClient()
const { t } = useLanguage()

const state = ref<ConfirmationState>('loading')

const title = computed(() => {
  if (state.value === 'success') return t('cancelConfirm.successTitle')
  if (state.value === 'error') return t('cancelConfirm.errorTitle')
  return t('cancelConfirm.loading')
})

const text = computed(() => {
  if (state.value === 'success') return t('cancelConfirm.successText')
  if (state.value === 'error') return t('cancelConfirm.errorText')
  return ''
})

onMounted(confirmCancellation)

async function confirmCancellation(): Promise<void> {
  const token = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token
  if (!token) {
    state.value = 'error'
    return
  }

  try {
    const tokenHash = await sha256Hex(token)
    const { data, error } = await supabase
      .rpc('confirm_booking_cancellation', { p_token_hash: tokenHash })
      .single()

    if (error) throw error

    const result = data as { success?: boolean } | null
    state.value = result?.success ? 'success' : 'error'
  } catch {
    state.value = 'error'
  }
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
</script>
