<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">{{ t('myBookings.title') }}</h1>
      <p class="text-slate-500 mt-1 text-sm">
        {{ t('myBookings.description') }}
      </p>
    </div>

    <!-- Lookup form -->
    <form class="flex gap-3 mb-8" novalidate @submit.prevent="lookup">
      <input
        v-model="matInput"
        type="text"
        inputmode="numeric"
        :placeholder="t('myBookings.placeholder')"
        maxlength="8"
        class="flex-1 max-w-sm rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
        :aria-label="t('myBookings.inputAria')"
        :aria-invalid="!!lookupError"
        :aria-describedby="lookupError ? 'mat-error' : undefined"
      />
      <button
        type="submit"
        :disabled="loading"
        class="bg-navy-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50"
      >
        {{ loading ? t('myBookings.searching') : t('myBookings.search') }}
      </button>
    </form>

    <p v-if="lookupError" id="mat-error" class="text-sm text-red-600 -mt-5 mb-6" role="alert">
      {{ lookupError }}
    </p>

    <!-- Results -->
    <div v-if="searched">
      <!-- Empty -->
      <div v-if="bookings.length === 0" class="text-center py-12 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p class="font-medium">{{ t('myBookings.emptyTitle') }}</p>
        <p class="text-sm mt-1">{{ t('myBookings.emptyText') }}</p>
      </div>

      <!-- Booking cards -->
      <div v-else class="space-y-3">
        <p class="text-sm text-slate-500 mb-4">
          {{ bookings.length }} {{ bookings.length === 1 ? t('myBookings.bookingSingular') : t('myBookings.bookingPlural') }} {{ t('myBookings.foundSuffix') }}
        </p>

        <article
          v-for="b in bookings"
          :key="b.id"
          class="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
        >
          <div>
            <p class="font-semibold text-slate-800">
              {{ formatDate(b.slot_start_time) }}
            </p>
            <p class="text-navy-700 font-medium mt-0.5">
              {{ formatTimeRange(b.slot_start_time, b.slot_end_time) }}
            </p>
            <p class="text-sm text-slate-500 mt-2">
              <span class="font-medium text-slate-700">{{ b.student_name }}</span> ·
              {{ t('myBookings.reasonLabel') }}: {{ b.anliegen }}
            </p>
          </div>

          <button
            :disabled="cancellingId === b.id"
            class="flex-shrink-0 text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :aria-label="cancelAriaLabel(b.slot_start_time)"
            @click="cancel(b.id)"
          >
            {{ cancellingId === b.id ? t('myBookings.cancelling') : t('myBookings.cancel') }}
          </button>
        </article>
      </div>
    </div>

    <!-- Cancel error -->
    <div
      v-if="cancelNotice"
      class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      role="status"
    >
      {{ cancelNotice }}
    </div>

    <div
      v-if="cancelError"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ cancelError }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, formatDate, formatTimeRange } = useLanguage()

const { bookings, loading, error: lookupError, fetchMyBookings, cancelBooking } = useMyBookings()

const matInput = ref('')
const searched = ref(false)
const cancellingId = ref<string | null>(null)
const cancelError = ref<string | null>(null)
const cancelNotice = ref<string | null>(null)

async function lookup(): Promise<void> {
  cancelError.value = null
  cancelNotice.value = null
  searched.value = false
  await fetchMyBookings(matInput.value)
  searched.value = true
}

async function cancel(bookingId: string): Promise<void> {
  cancelError.value = null
  cancelNotice.value = null
  cancellingId.value = bookingId
  const { success, message, emailSent } = await cancelBooking(bookingId)
  cancellingId.value = null
  if (!success) {
    cancelError.value = message ?? t('myBookings.cancelFallback')
    return
  }
  cancelNotice.value = emailSent ? t('myBookings.cancelEmailSent') : t('myBookings.cancelEmailQueued')
}

function cancelAriaLabel(slotStartTime: string): string {
  const suffix = t('myBookings.cancelAriaSuffix')
  return suffix
    ? `${t('myBookings.cancelAriaPrefix')} ${formatDate(slotStartTime)} ${suffix}`
    : `${t('myBookings.cancelAriaPrefix')} ${formatDate(slotStartTime)}`
}
</script>
