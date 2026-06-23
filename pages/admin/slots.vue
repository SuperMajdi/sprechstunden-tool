<template>
  <div>
    <h1 class="text-xl font-bold text-slate-800 mb-6">Zeitslots verwalten</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Create form -->
      <div class="lg:col-span-1">
        <AdminSlotForm @created="fetchAllSlots" />
      </div>

      <!-- Slot list -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-700">Alle Slots</h2>
            <span class="text-xs text-slate-400">{{ slots.length }} Einträge</span>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="p-5 space-y-2" aria-live="polite">
            <div v-for="i in 4" :key="i" class="h-12 bg-slate-100 rounded animate-pulse" />
          </div>

          <!-- Error -->
          <div v-else-if="error" class="p-5 text-sm text-red-600" role="alert">{{ error }}</div>

          <!-- Empty -->
          <div v-else-if="slots.length === 0" class="p-10 text-center text-sm text-slate-400">
            Noch keine Slots angelegt.
          </div>

          <!-- List -->
          <ul v-else class="divide-y divide-slate-100" aria-label="Slot-Liste">
            <li
              v-for="slot in slots"
              :key="slot.id"
              class="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p class="text-sm font-medium text-slate-800 tabular-nums">
                  {{ formatShortDate(slot.start_time) }} · {{ formatTimeRange(slot.start_time, slot.end_time) }}
                </p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span
                    :class="[
                      'text-xs font-medium px-1.5 py-0.5 rounded',
                      slot.is_locked
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-50 text-emerald-700',
                    ]"
                  >
                    {{ slot.is_locked ? 'Gesperrt' : 'Aktiv' }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                  :class="
                    slot.is_locked
                      ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                  "
                  :aria-label="`Slot ${slot.is_locked ? 'freigeben' : 'sperren'}`"
                  @click="toggle(slot)"
                >
                  {{ slot.is_locked ? 'Freigeben' : 'Sperren' }}
                </button>
                <button
                  class="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  :aria-label="`Slot löschen`"
                  @click="remove(slot.id)"
                >
                  Löschen
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Slot } from '~/types'
import { formatShortDate, formatTimeRange } from '~/utils'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { slots, loading, error, fetchAllSlots, toggleLock, deleteSlot } = useAdminSlots()

onMounted(fetchAllSlots)

async function toggle(slot: Slot): Promise<void> {
  const { success, message } = await toggleLock(slot)
  if (!success) alert(message)
}

async function remove(slotId: string): Promise<void> {
  if (!confirm('Slot wirklich löschen? Vorhandene Buchungen werden ebenfalls gelöscht.')) return
  const { success, message } = await deleteSlot(slotId)
  if (!success) alert(message)
}
</script>
