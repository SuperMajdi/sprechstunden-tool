// Central type definitions for the Sprechstunden-Tool

export interface Slot {
  id: string
  start_time: string // ISO 8601 timestamptz
  end_time: string
  is_locked: boolean
  created_at: string
}

/** Slot enriched with booking status — returned by the get_slots_with_status() RPC */
export interface SlotWithStatus extends Slot {
  is_booked: boolean
}

export interface Booking {
  id: string
  slot_id: string
  student_name: string
  student_email: string | null
  matrikelnummer: string
  anliegen: string
  created_at: string
}

/** Booking joined with slot times — returned by the get_my_bookings() RPC */
export interface MyBooking {
  id: string
  slot_id: string
  student_name: string
  anliegen: string
  created_at: string
  slot_start_time: string
  slot_end_time: string
}

/** Admin view: bookings with full details including joined slot */
export interface AdminBookingRow {
  id: string
  slot_id: string
  student_name: string
  student_email: string | null
  matrikelnummer: string
  anliegen: string
  created_at: string
  slots: Pick<Slot, 'start_time' | 'end_time'>
}

export type SlotStatus = 'available' | 'booked' | 'locked'

export interface BookingFormData {
  student_name: string
  student_email: string
  matrikelnummer: string
  anliegen: string
}

export type AppError =
  | 'slot_not_found'
  | 'slot_locked'
  | 'slot_unavailable'
  | 'invalid_email'
  | 'network_error'
  | 'unknown'
