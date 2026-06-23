<template>
  <div>
    <!-- Search -->
    <div class="mb-4">
      <input
        v-model="search"
        type="search"
        placeholder="Nach Name oder Matrikelnummer filtern …"
        class="w-full sm:w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
        aria-label="Buchungen filtern"
      />
    </div>

    <!-- Empty -->
    <p v-if="filtered.length === 0 && !loading" class="text-sm text-slate-500 py-8 text-center">
      {{ search ? 'Keine Treffer für Ihre Suche.' : 'Noch keine Buchungen vorhanden.' }}
    </p>

    <!-- Table -->
    <div v-else class="overflow-x-auto rounded-xl border border-slate-200">
      <table class="w-full text-sm" aria-label="Alle Buchungen">
        <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3 text-left font-medium">Datum & Zeit</th>
            <th class="px-4 py-3 text-left font-medium">Name</th>
            <th class="px-4 py-3 text-left font-medium">Matrikel-Nr.</th>
            <th class="px-4 py-3 text-left font-medium hidden md:table-cell">Anliegen</th>
            <th class="px-4 py-3 text-left font-medium hidden lg:table-cell">Gebucht am</th>
            <th class="px-4 py-3" aria-label="Aktionen" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="b in filtered"
            :key="b.id"
            class="hover:bg-slate-50 transition-colors"
          >
            <td class="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
              {{ formatShortDate(b.slots.start_time) }}<br />
              <span class="text-slate-500 font-normal text-xs">
                {{ formatTimeRange(b.slots.start_time, b.slots.end_time) }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-700">
              {{ b.student_name }}<br />
              <span class="text-xs text-slate-400">{{ b.student_email ?? 'Keine E-Mail' }}</span>
            </td>
            <td class="px-4 py-3 text-slate-500 font-mono">{{ b.matrikelnummer }}</td>
            <td class="px-4 py-3 text-slate-600 max-w-xs hidden md:table-cell">
              <span class="line-clamp-2">{{ b.anliegen }}</span>
            </td>
            <td class="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell whitespace-nowrap">
              {{ formatDate(b.created_at) }}
            </td>
            <td class="px-4 py-3 text-right">
              <button
                class="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                :aria-label="`Buchung von ${b.student_name} löschen`"
                @click="remove(b.id)"
              >
                Löschen
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-xs text-slate-400 mt-2">{{ filtered.length }} Buchung{{ filtered.length !== 1 ? 'en' : '' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { AdminBookingRow } from '~/types'
import { formatDate, formatShortDate, formatTimeRange } from '~/utils'

const props = defineProps<{
  bookings: AdminBookingRow[]
  loading: boolean
}>()

const emit = defineEmits<{ delete: [id: string] }>()

const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.bookings
  return props.bookings.filter(
    (b) =>
      b.student_name.toLowerCase().includes(q) ||
      (b.student_email?.toLowerCase().includes(q) ?? false) ||
      b.matrikelnummer.includes(q),
  )
})

async function remove(id: string): Promise<void> {
  if (!confirm('Buchung wirklich löschen?')) return
  emit('delete', id)
}
</script>
