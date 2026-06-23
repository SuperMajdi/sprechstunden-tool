<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">{{ t('home.title') }}</h1>
      <p class="text-slate-500 mt-1 text-sm">
        {{ t('home.descriptionPrefix') }} <strong>Prof. Dr. Christian Krauss</strong>.
      </p>
    </div>

    <!-- Slot grid -->
    <SlotGrid
      :slots="slots"
      :loading="loading"
      :error="error"
      @book="openModal"
      @retry="fetchSlots"
    />

    <!-- Booking modal -->
    <BookingModal
      :is-open="!!activeSlot"
      :slot-data="activeSlot"
      @close="closeModal"
      @booked="onBooked"
    />
  </div>
</template>

<script setup lang="ts">
import type { SlotWithStatus } from '~/types'

const { t } = useLanguage()
const { slots, loading, error, fetchSlots, markSlotBooked } = useBookingSlots()

const activeSlot = ref<SlotWithStatus | null>(null)

function openModal(slot: SlotWithStatus): void {
  activeSlot.value = slot
}

function closeModal(): void {
  activeSlot.value = null
}

/** Called by BookingModal after a successful booking.
 *  Updates the slot reactively without a full refetch. */
function onBooked(slotId: string): void {
  markSlotBooked(slotId)
}

onMounted(fetchSlots)
</script>
