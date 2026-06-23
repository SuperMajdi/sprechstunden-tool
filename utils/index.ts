import type { BookingFormData, AppError, SlotWithStatus, SlotStatus } from '~/types'

type AppLanguage = 'de' | 'en'

// ── Date/Time Formatting ──────────────────────────────────────────────────────

const DE_LOCALE = 'de-DE'
const BERLIN_TZ = 'Europe/Berlin'

/** "Montag, 7. Juli 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(DE_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: BERLIN_TZ,
  })
}

/** "10:00" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(DE_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: BERLIN_TZ,
  })
}

/** "10:00 – 10:30 Uhr" */
export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)} Uhr`
}

/** "Mo, 07.07." */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(DE_LOCALE, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: BERLIN_TZ,
  })
}

// ── Booking Form Validation ───────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: Partial<Record<keyof BookingFormData, string>>
}

const VALIDATION_MESSAGES: Record<AppLanguage, Record<keyof BookingFormData, string>> = {
  de: {
    student_name: 'Bitte geben Sie Ihren vollständigen Namen ein (mind. 2 Zeichen).',
    student_email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    matrikelnummer: 'Matrikelnummer muss 6-8 Ziffern enthalten.',
    anliegen: 'Bitte beschreiben Sie Ihr Anliegen (mind. 5 Zeichen).',
  },
  en: {
    student_name: 'Please enter your full name (at least 2 characters).',
    student_email: 'Please enter a valid email address.',
    matrikelnummer: 'Student ID number must contain 6-8 digits.',
    anliegen: 'Please describe your topic (at least 5 characters).',
  },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validates the student booking form fields.
 *  Returns { valid: true, errors: {} } on success. */
export function validateBookingForm(data: BookingFormData, language: AppLanguage = 'de'): ValidationResult {
  const errors: Partial<Record<keyof BookingFormData, string>> = {}
  const messages = VALIDATION_MESSAGES[language]

  if (!data.student_name || data.student_name.trim().length < 2) {
    errors.student_name = messages.student_name
  }

  if (!data.student_email || !EMAIL_RE.test(data.student_email.trim())) {
    errors.student_email = messages.student_email
  }

  if (!data.matrikelnummer || !/^\d{6,8}$/.test(data.matrikelnummer.trim())) {
    errors.matrikelnummer = messages.matrikelnummer
  }

  if (!data.anliegen || data.anliegen.trim().length < 5) {
    errors.anliegen = messages.anliegen
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// ── Slot Status ───────────────────────────────────────────────────────────────

export function getSlotStatus(slot: SlotWithStatus): SlotStatus {
  if (slot.is_locked) return 'locked'
  if (slot.is_booked) return 'booked'
  return 'available'
}

// ── Error Mapping ─────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<AppLanguage, Record<AppError, string>> = {
  de: {
    slot_not_found:  'Dieser Slot existiert nicht mehr.',
    slot_locked:     'Dieser Slot wurde vom Admin gesperrt.',
    slot_unavailable:'Dieser Slot wurde soeben von jemand anderem gebucht. Bitte wählen Sie einen anderen.',
    invalid_email:   'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    network_error:   'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    unknown:         'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
  },
  en: {
    slot_not_found:  'This slot no longer exists.',
    slot_locked:     'This slot has been locked by the admin.',
    slot_unavailable:'This slot has just been booked by someone else. Please choose another one.',
    invalid_email:   'Please enter a valid email address.',
    network_error:   'Network error. Please check your connection and try again.',
    unknown:         'An unknown error occurred. Please try again.',
  },
}

export function getErrorMessage(err: unknown, language: AppLanguage = 'de'): string {
  const messages = ERROR_MESSAGES[language]
  if (err instanceof Error) {
    const msg = err.message as AppError
    if (msg in messages) return messages[msg]
    if (err.message.includes('fetch') || err.message.includes('network')) {
      return messages.network_error
    }
  }
  return messages.unknown
}

// ── Group slots by date ───────────────────────────────────────────────────────

export function groupSlotsByDate(slots: SlotWithStatus[]): Map<string, SlotWithStatus[]> {
  const map = new Map<string, SlotWithStatus[]>()
  for (const slot of slots) {
    const dateKey = new Date(slot.start_time).toLocaleDateString(DE_LOCALE, {
      timeZone: BERLIN_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const existing = map.get(dateKey) ?? []
    existing.push(slot)
    map.set(dateKey, existing)
  }
  return map
}
