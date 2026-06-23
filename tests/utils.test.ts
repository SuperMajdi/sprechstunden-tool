import { describe, it, expect } from 'vitest'
import {
  validateBookingForm,
  getSlotStatus,
  getErrorMessage,
  formatTimeRange,
  groupSlotsByDate,
} from '../utils/index'
import type { BookingFormData, SlotWithStatus } from '../types/index'

// ── validateBookingForm ───────────────────────────────────────────────────────

describe('validateBookingForm', () => {
  const validForm: BookingFormData = {
    student_name: 'Maria Muster',
    student_email: 'maria.muster@example.com',
    matrikelnummer: '1234567',
    anliegen: 'Frage zur Klausur',
  }

  it('accepts a fully valid form', () => {
    const result = validateBookingForm(validForm)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('rejects a name that is too short', () => {
    const result = validateBookingForm({ ...validForm, student_name: 'A' })
    expect(result.valid).toBe(false)
    expect(result.errors.student_name).toBeDefined()
  })

  it('rejects an empty name', () => {
    const result = validateBookingForm({ ...validForm, student_name: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects an invalid email address', () => {
    const result = validateBookingForm({ ...validForm, student_email: 'not-an-email' })
    expect(result.valid).toBe(false)
    expect(result.errors.student_email).toBeDefined()
  })

  it('rejects a non-numeric Matrikelnummer', () => {
    const result = validateBookingForm({ ...validForm, matrikelnummer: 'ABC123' })
    expect(result.valid).toBe(false)
    expect(result.errors.matrikelnummer).toBeDefined()
  })

  it('rejects a Matrikelnummer shorter than 6 digits', () => {
    const result = validateBookingForm({ ...validForm, matrikelnummer: '12345' })
    expect(result.valid).toBe(false)
  })

  it('rejects a Matrikelnummer longer than 8 digits', () => {
    const result = validateBookingForm({ ...validForm, matrikelnummer: '123456789' })
    expect(result.valid).toBe(false)
  })

  it('accepts a 6-digit and an 8-digit Matrikelnummer', () => {
    expect(validateBookingForm({ ...validForm, matrikelnummer: '123456' }).valid).toBe(true)
    expect(validateBookingForm({ ...validForm, matrikelnummer: '12345678' }).valid).toBe(true)
  })

  it('rejects an Anliegen shorter than 5 characters', () => {
    const result = validateBookingForm({ ...validForm, anliegen: 'Hi' })
    expect(result.valid).toBe(false)
    expect(result.errors.anliegen).toBeDefined()
  })

  it('collects multiple field errors at once', () => {
    const result = validateBookingForm({ student_name: '', student_email: '', matrikelnummer: 'x', anliegen: '' })
    expect(result.valid).toBe(false)
    expect(Object.keys(result.errors)).toHaveLength(4)
  })
})

// ── getSlotStatus ─────────────────────────────────────────────────────────────

describe('getSlotStatus', () => {
  const baseSlot: SlotWithStatus = {
    id: 'abc',
    start_time: '2026-07-01T10:00:00Z',
    end_time: '2026-07-01T10:30:00Z',
    is_locked: false,
    is_booked: false,
    created_at: '2026-01-01T00:00:00Z',
  }

  it('returns "available" when not locked and not booked', () => {
    expect(getSlotStatus(baseSlot)).toBe('available')
  })

  it('returns "booked" when is_booked is true', () => {
    expect(getSlotStatus({ ...baseSlot, is_booked: true })).toBe('booked')
  })

  it('returns "locked" when is_locked is true, even if not booked', () => {
    expect(getSlotStatus({ ...baseSlot, is_locked: true })).toBe('locked')
  })

  it('returns "locked" when both is_locked and is_booked are true (locked takes precedence)', () => {
    expect(getSlotStatus({ ...baseSlot, is_locked: true, is_booked: true })).toBe('locked')
  })
})

// ── getErrorMessage ───────────────────────────────────────────────────────────

describe('getErrorMessage', () => {
  it('maps known AppError strings to German messages', () => {
    expect(getErrorMessage(new Error('slot_unavailable'))).toContain('soeben')
    expect(getErrorMessage(new Error('slot_locked'))).toContain('gesperrt')
    expect(getErrorMessage(new Error('slot_not_found'))).toContain('existiert nicht')
  })

  it('maps network-like errors to network message', () => {
    const msg = getErrorMessage(new Error('fetch failed: network unreachable'))
    expect(msg).toContain('Netzwerkfehler')
  })

  it('returns a generic message for unknown errors', () => {
    expect(getErrorMessage(new Error('something weird'))).toContain('unbekannter')
  })

  it('handles non-Error throw values gracefully', () => {
    expect(getErrorMessage('string error')).toContain('unbekannter')
    expect(getErrorMessage(null)).toContain('unbekannter')
    expect(getErrorMessage(42)).toContain('unbekannter')
  })
})

// ── groupSlotsByDate ──────────────────────────────────────────────────────────

describe('groupSlotsByDate', () => {
  const make = (dateStr: string, i: number): SlotWithStatus => ({
    id: `slot-${i}`,
    start_time: `${dateStr}T10:00:00+02:00`,
    end_time: `${dateStr}T10:30:00+02:00`,
    is_locked: false,
    is_booked: false,
    created_at: '2026-01-01T00:00:00Z',
  })

  it('groups slots from the same date into one key', () => {
    const slots = [make('2026-07-01', 1), make('2026-07-01', 2), make('2026-07-02', 3)]
    const grouped = groupSlotsByDate(slots)
    expect(grouped.size).toBe(2)
    const values = [...grouped.values()]
    expect(values[0]).toHaveLength(2)
    expect(values[1]).toHaveLength(1)
  })

  it('returns an empty map for an empty input', () => {
    expect(groupSlotsByDate([])).toEqual(new Map())
  })
})

// ── formatTimeRange ───────────────────────────────────────────────────────────

describe('formatTimeRange', () => {
  it('formats a time range in German locale format', () => {
    const result = formatTimeRange('2026-07-01T08:00:00.000Z', '2026-07-01T08:30:00.000Z')
    // Result should contain digits and a dash separator
    expect(result).toMatch(/\d{2}:\d{2}/)
    expect(result).toContain('–')
    expect(result).toContain('Uhr')
  })
})
