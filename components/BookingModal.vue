<template>
  <!-- Modal backdrop -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.esc="$emit('close')"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          @click="$emit('close')"
        />

        <!-- Panel -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <!-- ── Success state ── -->
          <div v-if="confirmed" class="p-8 text-center">
            <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-slate-800">{{ t('booking.confirmedTitle') }}</h2>
            <p class="mt-2 text-slate-600 text-sm">
              {{ formatDate(slotData!.start_time) }}<br />
              <strong>{{ formatTimeRange(slotData!.start_time, slotData!.end_time) }}</strong>
            </p>
            <p class="mt-3 text-xs text-slate-500">
              {{ t('booking.confirmedTextBefore') }}
              <strong>{{ t('nav.myBookings') }}</strong>
              {{ t('booking.confirmedTextAfter') }}
            </p>
            <button
              class="mt-6 w-full bg-navy-700 text-white font-semibold py-2.5 rounded-lg hover:bg-navy-800 transition-colors"
              @click="$emit('close')"
            >
              {{ t('booking.close') }}
            </button>
          </div>

          <!-- ── Booking form ── -->
          <div v-else>
            <div class="p-6 border-b border-slate-100">
              <div class="flex items-start justify-between">
                <div>
                  <h2 :id="titleId" class="text-lg font-bold text-slate-800">{{ t('booking.title') }}</h2>
                  <p class="text-sm text-slate-500 mt-0.5">
                    {{ formatDate(slotData!.start_time) }} ·
                    <span class="font-medium text-navy-700">{{ formatTimeRange(slotData!.start_time, slotData!.end_time) }}</span>
                  </p>
                </div>
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  :aria-label="t('booking.close')"
                  @click="$emit('close')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <form class="p-6 space-y-4" novalidate @submit.prevent="submit">
              <!-- Name -->
              <div>
                <label for="student_name" class="block text-sm font-medium text-slate-700 mb-1">
                  {{ t('booking.nameLabel') }} <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="student_name"
                  v-model="form.student_name"
                  type="text"
                  autocomplete="name"
                  :placeholder="t('booking.namePlaceholder')"
                  :class="inputClass('student_name')"
                  aria-required="true"
                  :aria-describedby="errors.student_name ? 'err-name' : undefined"
                />
                <p v-if="errors.student_name" id="err-name" class="mt-1 text-xs text-red-600" role="alert">
                  {{ errors.student_name }}
                </p>
              </div>

              <!-- Email -->
              <div>
                <label for="student_email" class="block text-sm font-medium text-slate-700 mb-1">
                  {{ t('booking.emailLabel') }} <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="student_email"
                  v-model="form.student_email"
                  type="email"
                  autocomplete="email"
                  :placeholder="t('booking.emailPlaceholder')"
                  :class="inputClass('student_email')"
                  aria-required="true"
                  :aria-describedby="errors.student_email ? 'err-email' : undefined"
                />
                <p v-if="errors.student_email" id="err-email" class="mt-1 text-xs text-red-600" role="alert">
                  {{ errors.student_email }}
                </p>
              </div>

              <!-- Matrikelnummer -->
              <div>
                <label for="matrikelnummer" class="block text-sm font-medium text-slate-700 mb-1">
                  {{ t('booking.studentIdLabel') }} <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="matrikelnummer"
                  v-model="form.matrikelnummer"
                  type="text"
                  inputmode="numeric"
                  :placeholder="t('booking.studentIdPlaceholder')"
                  :class="inputClass('matrikelnummer')"
                  aria-required="true"
                  :aria-describedby="errors.matrikelnummer ? 'err-mat' : undefined"
                />
                <p v-if="errors.matrikelnummer" id="err-mat" class="mt-1 text-xs text-red-600" role="alert">
                  {{ errors.matrikelnummer }}
                </p>
              </div>

              <!-- Anliegen -->
              <div>
                <label for="anliegen" class="block text-sm font-medium text-slate-700 mb-1">
                  {{ t('booking.topicLabel') }} <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="anliegen"
                  v-model="form.anliegen"
                  rows="3"
                  :placeholder="t('booking.topicPlaceholder')"
                  :class="inputClass('anliegen')"
                  aria-required="true"
                  :aria-describedby="errors.anliegen ? 'err-anliegen' : undefined"
                />
                <p v-if="errors.anliegen" id="err-anliegen" class="mt-1 text-xs text-red-600" role="alert">
                  {{ errors.anliegen }}
                </p>
              </div>

              <!-- Submit error -->
              <div
                v-if="submitError"
                class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {{ submitError }}
              </div>

              <button
                type="submit"
                :disabled="submitting"
                class="w-full bg-navy-700 text-white font-semibold py-3 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="submitting" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ submitting ? t('booking.submitting') : t('booking.submit') }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SlotWithStatus, BookingFormData } from '~/types'
import { validateBookingForm } from '~/utils'

const props = defineProps<{
  isOpen: boolean
  slotData: SlotWithStatus | null
}>()

const emit = defineEmits<{
  close: []
  booked: [slotId: string]
}>()

const { bookSlot, loading: submitting } = useBookings()
const { t, language, formatDate, formatTimeRange } = useLanguage()

const titleId = 'booking-modal-title'

const form = reactive<BookingFormData>({
  student_name: '',
  student_email: '',
  matrikelnummer: '',
  anliegen: '',
})
const errors = reactive<Partial<Record<keyof BookingFormData, string>>>({})
const submitError = ref<string | null>(null)
const confirmed = ref(false)

// Reset state when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.student_name = ''
      form.student_email = ''
      form.matrikelnummer = ''
      form.anliegen = ''
      Object.keys(errors).forEach((k) => delete (errors as Record<string, string>)[k])
      submitError.value = null
      confirmed.value = false
    }
  },
)

function inputClass(field: keyof BookingFormData): string {
  const base =
    'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors'
  return errors[field]
    ? `${base} border-red-400 focus:ring-red-300 bg-red-50`
    : `${base} border-slate-300 focus:ring-navy-400 bg-white`
}

async function submit(): Promise<void> {
  submitError.value = null
  Object.keys(errors).forEach((k) => delete (errors as Record<string, string>)[k])
  const validation = validateBookingForm(form, language.value)
  Object.assign(errors, validation.errors)
  if (!validation.valid) return

  const { bookingId, errorMessage } = await bookSlot(props.slotData!.id, form)
  if (bookingId) {
    confirmed.value = true
    emit('booked', props.slotData!.id)
  } else {
    submitError.value = errorMessage ?? t('errors.unknownShort')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
