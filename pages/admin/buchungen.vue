<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800">Alle Buchungen</h1>
      <button
        class="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5"
        :disabled="loading"
        @click="fetchAllBookings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.03" />
        </svg>
        Aktualisieren
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2" aria-live="polite">
      <div v-for="i in 5" :key="i" class="h-12 bg-slate-200 rounded animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm" role="alert">
      {{ error }}
    </div>

    <AdminBookingTable
      v-else
      :bookings="bookings"
      :loading="loading"
      @delete="deleteBooking"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { bookings, loading, error, fetchAllBookings, deleteBooking } = useAdminBookings()

onMounted(fetchAllBookings)
</script>
