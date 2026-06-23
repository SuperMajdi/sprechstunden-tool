<template>
  <button
    :class="[
      'w-full text-left rounded-xl border-2 p-4 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
      statusClasses,
    ]"
    :disabled="!isAvailable"
    :aria-label="ariaLabel"
    :aria-disabled="!isAvailable"
    @click="isAvailable && $emit('book', slot)"
  >
    <!-- Time range -->
    <div class="font-semibold text-base tabular-nums">
      {{ formatTimeRange(slot.start_time, slot.end_time) }}
    </div>

    <!-- Status badge -->
    <div class="mt-1.5 flex items-center gap-1.5">
      <span :class="['inline-block w-2 h-2 rounded-full flex-shrink-0', dotClass]" aria-hidden="true" />
      <span class="text-xs font-medium" :class="labelClass">{{ statusLabel }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { SlotWithStatus } from '~/types'
import { getSlotStatus } from '~/utils'

const props = defineProps<{ slot: SlotWithStatus }>()
defineEmits<{ book: [slot: SlotWithStatus] }>()

const { t, formatTimeRange } = useLanguage()

const status = computed(() => getSlotStatus(props.slot))
const isAvailable = computed(() => status.value === 'available')

const statusClasses = computed(() => {
  switch (status.value) {
    case 'available':
      return 'border-emerald-400 bg-white hover:bg-emerald-50 hover:border-emerald-500 cursor-pointer focus:ring-emerald-400'
    case 'booked':
      return 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-70'
    case 'locked':
      return 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
  }
})

const dotClass = computed(() => {
  switch (status.value) {
    case 'available': return 'bg-emerald-500'
    case 'booked':    return 'bg-red-400'
    case 'locked':    return 'bg-slate-400'
  }
})

const labelClass = computed(() => {
  switch (status.value) {
    case 'available': return 'text-emerald-700'
    case 'booked':    return 'text-red-600'
    case 'locked':    return 'text-slate-500'
  }
})

const statusLabel = computed(() => {
  switch (status.value) {
    case 'available': return t('slot.available')
    case 'booked':    return t('slot.booked')
    case 'locked':    return t('slot.locked')
  }
})

const ariaLabel = computed(
  () => `${formatTimeRange(props.slot.start_time, props.slot.end_time)}: ${statusLabel.value}`,
)
</script>
