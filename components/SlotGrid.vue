<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-6" aria-live="polite" :aria-label="t('slots.loading')">
      <div v-for="i in 2" :key="i" class="animate-pulse">
        <div class="h-5 bg-slate-200 rounded w-40 mb-3" />
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div v-for="j in 4" :key="j" class="h-20 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm"
      role="alert"
    >
      <strong class="font-semibold">{{ t('slots.errorPrefix') }}</strong> {{ error }}
      <button
        class="ml-4 underline hover:no-underline text-red-800"
        @click="$emit('retry')"
      >
        {{ t('slots.retry') }}
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="slotsByDate.size === 0"
      class="text-center py-16 text-slate-500"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <p class="font-medium">{{ t('slots.emptyTitle') }}</p>
      <p class="text-sm mt-1">{{ t('slots.emptyText') }}</p>
    </div>

    <!-- Slot grid grouped by date -->
    <div v-else class="space-y-8">
      <section v-for="[dateKey, daySlots] in slotsByDate" :key="dateKey">
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {{ formatDate(daySlots[0].start_time) }}
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <SlotCard
            v-for="slotItem in daySlots"
            :key="slotItem.id"
            v-bind="{ slot: slotItem }"
            @book="$emit('book', $event)"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SlotWithStatus } from '~/types'
import { groupSlotsByDate } from '~/utils'

const { t, formatDate } = useLanguage()

const props = defineProps<{
  slots: SlotWithStatus[]
  loading: boolean
  error: string | null
}>()

defineEmits<{
  book: [slot: SlotWithStatus]
  retry: []
}>()

const slotsByDate = computed(() => groupSlotsByDate(props.slots))
</script>
