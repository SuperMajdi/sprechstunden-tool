import type { SlotWithStatus, Slot } from '~/types'
import { getErrorMessage } from '~/utils'

/** Composable for student-facing slot data (uses secure RPC). */
export function useBookingSlots() {
  const supabase = useSupabaseClient()
  const { language } = useLanguage()

  const slots = ref<SlotWithStatus[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSlots(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase.rpc('get_slots_with_status')
      if (err) throw err
      slots.value = (data as SlotWithStatus[]) ?? []
    } catch (e) {
      error.value = getErrorMessage(e, language.value)
    } finally {
      loading.value = false
    }
  }

  /** Optimistically marks a slot as booked without a full refetch. */
  function markSlotBooked(slotId: string): void {
    const idx = slots.value.findIndex((s) => s.id === slotId)
    if (idx !== -1) {
      slots.value[idx] = { ...slots.value[idx], is_booked: true }
    }
  }

  return { slots, loading, error, fetchSlots, markSlotBooked }
}

// ── Admin Slot Operations ─────────────────────────────────────────────────────

/** Composable for admin slot management (requires authenticated session). */
export function useAdminSlots() {
  const supabase = useSupabaseClient()
  const { language } = useLanguage()

  const slots = ref<Slot[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAllSlots(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('slots')
        .select('*')
        .order('start_time', { ascending: true })
      if (err) throw err
      slots.value = (data as Slot[]) ?? []
    } catch (e) {
      error.value = getErrorMessage(e, language.value)
    } finally {
      loading.value = false
    }
  }

  async function createSlot(startTime: Date): Promise<{ success: boolean; message?: string }> {
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000)
    try {
      const { data, error: err } = await supabase
        .from('slots')
        .insert({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        })
        .select()
        .single()
      if (err) {
        // 23P01 = exclusion violation (overlapping slot)
        if (err.code === '23P01') {
          return { success: false, message: 'Dieser Zeitraum überschneidet sich mit einem vorhandenen Slot.' }
        }
        throw err
      }
      slots.value.push(data as Slot)
      slots.value.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e, language.value) }
    }
  }

  async function toggleLock(slot: Slot): Promise<{ success: boolean; message?: string }> {
    try {
      const { error: err } = await supabase
        .from('slots')
        .update({ is_locked: !slot.is_locked })
        .eq('id', slot.id)
      if (err) throw err
      // Update in local state reactively
      const idx = slots.value.findIndex((s) => s.id === slot.id)
      if (idx !== -1) slots.value[idx] = { ...slots.value[idx], is_locked: !slot.is_locked }
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e, language.value) }
    }
  }

  async function deleteSlot(slotId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error: err } = await supabase.from('slots').delete().eq('id', slotId)
      if (err) throw err
      slots.value = slots.value.filter((s) => s.id !== slotId)
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e, language.value) }
    }
  }

  return { slots, loading, error, fetchAllSlots, createSlot, toggleLock, deleteSlot }
}
