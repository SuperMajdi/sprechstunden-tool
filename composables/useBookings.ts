import type { BookingFormData, MyBooking, AdminBookingRow } from '~/types'
import { validateBookingForm, getErrorMessage } from '~/utils'

/** Student-facing booking operations. All go through SECURITY DEFINER RPCs. */
export function useBookings() {
  const supabase = useSupabaseClient()
  const { language, t } = useLanguage()

  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Books a slot via the atomic book_slot() RPC.
   *  Returns the new booking id on success, or null on failure. */
  async function bookSlot(
    slotId: string,
    formData: BookingFormData,
  ): Promise<{ bookingId: string | null; errorMessage?: string }> {
    const validation = validateBookingForm(formData, language.value)
    if (!validation.valid) {
      return { bookingId: null, errorMessage: t('errors.formInvalid') }
    }

    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase.rpc('book_slot', {
        p_slot_id: slotId,
        p_student_name: formData.student_name.trim(),
        p_student_email: formData.student_email.trim().toLowerCase(),
        p_matrikelnummer: formData.matrikelnummer.trim(),
        p_anliegen: formData.anliegen.trim(),
      })
      if (err) throw new Error(err.message)
      return { bookingId: data as string }
    } catch (e) {
      const msg = getErrorMessage(e, language.value)
      error.value = msg
      return { bookingId: null, errorMessage: msg }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, bookSlot }
}

/** Student lookup: find and cancel own bookings by Matrikelnummer. */
export function useMyBookings() {
  const supabase = useSupabaseClient()
  const { language, t } = useLanguage()

  const bookings = ref<MyBooking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const matrikelnummer = ref('')

  async function fetchMyBookings(mat: string): Promise<void> {
    if (!/^\d{6,8}$/.test(mat.trim())) {
      error.value = t('errors.invalidMat')
      return
    }
    loading.value = true
    error.value = null
    matrikelnummer.value = mat.trim()
    try {
      const { data, error: err } = await supabase.rpc('get_my_bookings', {
        p_matrikelnummer: mat.trim(),
      })
      if (err) throw err
      bookings.value = (data as MyBooking[]) ?? []
    } catch (e) {
      error.value = getErrorMessage(e, language.value)
    } finally {
      loading.value = false
    }
  }

  async function cancelBooking(bookingId: string): Promise<{ success: boolean; message?: string; emailSent?: boolean }> {
    loading.value = true
    try {
      const { data, error: err } = await supabase.functions.invoke('request-cancellation', {
        body: {
          bookingId,
          matrikelnummer: matrikelnummer.value,
          language: language.value,
        },
      })
      if (err) throw err

      const result = data as { success?: boolean; message?: string; emailSent?: boolean } | null
      if (!result?.success) {
        return { success: false, message: result?.message ?? t('errors.bookingMismatch') }
      }

      return { success: true, emailSent: result.emailSent ?? true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e, language.value) }
    } finally {
      loading.value = false
    }
  }

  return { bookings, loading, error, matrikelnummer, fetchMyBookings, cancelBooking }
}

/** Admin: view all bookings with slot details. */
export function useAdminBookings() {
  const supabase = useSupabaseClient()
  const { language } = useLanguage()

  const bookings = ref<AdminBookingRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAllBookings(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          id,
          slot_id,
          student_name,
          student_email,
          matrikelnummer,
          anliegen,
          created_at,
          slots ( start_time, end_time )
        `)
        .order('created_at', { ascending: false })
      if (err) throw err
      bookings.value = (data as AdminBookingRow[]) ?? []
    } catch (e) {
      error.value = getErrorMessage(e, language.value)
    } finally {
      loading.value = false
    }
  }

  async function deleteBooking(bookingId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error: err } = await supabase.from('bookings').delete().eq('id', bookingId)
      if (err) throw err
      bookings.value = bookings.value.filter((b) => b.id !== bookingId)
      return { success: true }
    } catch (e) {
      return { success: false, message: getErrorMessage(e, language.value) }
    }
  }

  return { bookings, loading, error, fetchAllBookings, deleteBooking }
}
