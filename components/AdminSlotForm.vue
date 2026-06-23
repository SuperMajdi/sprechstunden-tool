<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5">
    <h2 class="text-base font-semibold text-slate-800 mb-4">Neuen Slot anlegen</h2>

    <form class="space-y-4" novalidate @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-3">
        <!-- Date -->
        <div>
          <label for="slot-date" class="block text-xs font-medium text-slate-600 mb-1">
            Datum <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="slot-date"
            v-model="dateInput"
            type="date"
            :min="todayStr"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
            aria-required="true"
          />
        </div>

        <!-- Time -->
        <div>
          <label for="slot-time" class="block text-xs font-medium text-slate-600 mb-1">
            Startzeit <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="slot-time"
            v-model="timeInput"
            type="time"
            step="1800"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
            aria-required="true"
          />
        </div>
      </div>

      <!-- Preview -->
      <p v-if="preview" class="text-xs text-slate-500">
        Slot: <strong class="text-slate-700">{{ preview }}</strong> (30 Minuten)
      </p>

      <!-- Error -->
      <p v-if="error" class="text-xs text-red-600" role="alert">{{ error }}</p>

      <!-- Success -->
      <p v-if="success" class="text-xs text-emerald-600 font-medium" role="status">
        ✓ Slot wurde angelegt.
      </p>

      <button
        type="submit"
        :disabled="submitting || !dateInput || !timeInput"
        class="w-full bg-navy-700 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ submitting ? 'Wird angelegt …' : 'Slot anlegen' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatTimeRange } from '~/utils'

const emit = defineEmits<{ created: [] }>()

const { createSlot } = useAdminSlots()

const dateInput = ref('')
const timeInput = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const todayStr = computed(() => new Date().toISOString().split('T')[0])

const preview = computed(() => {
  if (!dateInput.value || !timeInput.value) return null
  const start = new Date(`${dateInput.value}T${timeInput.value}`)
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  return `${formatDate(start.toISOString())}, ${formatTimeRange(start.toISOString(), end.toISOString())}`
})

async function submit(): Promise<void> {
  if (!dateInput.value || !timeInput.value) return
  error.value = null
  success.value = false
  submitting.value = true

  const startTime = new Date(`${dateInput.value}T${timeInput.value}`)
  const result = await createSlot(startTime)

  submitting.value = false
  if (result.success) {
    success.value = true
    timeInput.value = ''
    emit('created')
    setTimeout(() => (success.value = false), 3000)
  } else {
    error.value = result.message ?? 'Fehler beim Anlegen.'
  }
}
</script>
