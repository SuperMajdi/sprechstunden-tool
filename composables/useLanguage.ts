export type AppLanguage = 'de' | 'en'

const STORAGE_KEY = 'sprechstunden-language'
const BERLIN_TZ = 'Europe/Berlin'

const LOCALES: Record<AppLanguage, string> = {
  de: 'de-DE',
  en: 'en-GB',
}

const translations = {
  de: {
    'language.label': 'Sprache auswählen',
    'language.de': 'Deutsch',
    'language.en': 'Englisch',
    'brand.title': 'Sprechstunden',
    'nav.myBookings': 'Meine Buchungen',
    'footer.institute': 'Hochschule für Angewandte Wissenschaften Kiel · Institut für Wirtschaftsinformatik',
    'footer.admin': 'Admin-Bereich',
    'home.title': 'Sprechstunden buchen',
    'home.descriptionPrefix': 'Wählen Sie einen freien 30-Minuten-Slot bei',
    'slots.loading': 'Slots werden geladen',
    'slots.errorPrefix': 'Fehler beim Laden:',
    'slots.retry': 'Erneut versuchen',
    'slots.emptyTitle': 'Keine Termine verfügbar',
    'slots.emptyText': 'Aktuell sind keine Sprechstunden-Slots eingestellt.',
    'slot.available': 'Verfügbar - Jetzt buchen',
    'slot.booked': 'Bereits vergeben',
    'slot.locked': 'Gesperrt',
    'booking.confirmedTitle': 'Buchung bestätigt!',
    'booking.confirmedTextBefore': 'Ihre Buchung wurde erfolgreich gespeichert. Unter',
    'booking.confirmedTextAfter': 'können Sie diese einsehen oder stornieren.',
    'booking.close': 'Schließen',
    'booking.title': 'Termin buchen',
    'booking.nameLabel': 'Vor- und Nachname',
    'booking.namePlaceholder': 'Maria Musterfrau',
    'booking.emailLabel': 'E-Mail-Adresse',
    'booking.emailPlaceholder': 'maria.muster@example.com',
    'booking.studentIdLabel': 'Matrikelnummer',
    'booking.studentIdPlaceholder': '1234567',
    'booking.topicLabel': 'Anliegen / Thema',
    'booking.topicPlaceholder': 'Kurzbeschreibung des Themas ...',
    'booking.submitting': 'Wird gebucht ...',
    'booking.submit': 'Jetzt buchen',
    'myBookings.title': 'Meine Buchungen',
    'myBookings.description': 'Geben Sie Ihre Matrikelnummer ein, um Ihre Buchungen einzusehen oder eine Stornierung per E-Mail zu bestätigen.',
    'myBookings.placeholder': 'Matrikelnummer (6-8 Ziffern)',
    'myBookings.inputAria': 'Matrikelnummer eingeben',
    'myBookings.searching': 'Suche ...',
    'myBookings.search': 'Suchen',
    'myBookings.emptyTitle': 'Keine Buchungen gefunden',
    'myBookings.emptyText': 'Für diese Matrikelnummer liegen keine Buchungen vor.',
    'myBookings.bookingSingular': 'Buchung',
    'myBookings.bookingPlural': 'Buchungen',
    'myBookings.foundSuffix': 'gefunden:',
    'myBookings.reasonLabel': 'Anliegen',
    'myBookings.cancelAriaPrefix': 'Buchung am',
    'myBookings.cancelAriaSuffix': 'stornieren',
    'myBookings.cancelling': 'E-Mail wird gesendet ...',
    'myBookings.cancel': 'Stornieren',
    'myBookings.cancelEmailSent': 'Wir haben eine Bestätigungs-E-Mail gesendet. Die Buchung wird erst storniert, wenn Sie den Link in der E-Mail öffnen.',
    'myBookings.cancelEmailQueued': 'Die Stornierung wurde vorbereitet. Der E-Mail-Versand ist noch nicht konfiguriert.',
    'myBookings.cancelFallback': 'Stornierung fehlgeschlagen.',
    'cancelConfirm.loading': 'Stornierung wird bestätigt ...',
    'cancelConfirm.successTitle': 'Termin storniert',
    'cancelConfirm.successText': 'Die Buchung wurde entfernt. Der Slot ist jetzt wieder verfügbar.',
    'cancelConfirm.errorTitle': 'Stornierung nicht möglich',
    'cancelConfirm.errorText': 'Der Link ist ungültig oder bereits abgelaufen.',
    'cancelConfirm.homeLink': 'Zur Buchung',
    'cancelConfirm.myBookingsLink': 'Meine Buchungen',
    'errors.formInvalid': 'Bitte füllen Sie alle Felder korrekt aus.',
    'errors.unknownShort': 'Unbekannter Fehler.',
    'errors.invalidMat': 'Bitte geben Sie eine gültige Matrikelnummer ein (6-8 Ziffern).',
    'errors.bookingMismatch': 'Buchung nicht gefunden oder Matrikelnummer stimmt nicht überein.',
  },
  en: {
    'language.label': 'Choose language',
    'language.de': 'German',
    'language.en': 'English',
    'brand.title': 'Consultations',
    'nav.myBookings': 'My bookings',
    'footer.institute': 'Kiel University of Applied Sciences · Institute of Business Information Systems',
    'footer.admin': 'Admin area',
    'home.title': 'Book a consultation',
    'home.descriptionPrefix': 'Choose a free 30-minute slot with',
    'slots.loading': 'Loading slots',
    'slots.errorPrefix': 'Error loading:',
    'slots.retry': 'Try again',
    'slots.emptyTitle': 'No appointments available',
    'slots.emptyText': 'There are currently no consultation slots available.',
    'slot.available': 'Available - book now',
    'slot.booked': 'Already booked',
    'slot.locked': 'Locked',
    'booking.confirmedTitle': 'Booking confirmed!',
    'booking.confirmedTextBefore': 'Your booking has been saved. You can view or cancel it under',
    'booking.confirmedTextAfter': '',
    'booking.close': 'Close',
    'booking.title': 'Book appointment',
    'booking.nameLabel': 'First and last name',
    'booking.namePlaceholder': 'Jane Doe',
    'booking.emailLabel': 'Email address',
    'booking.emailPlaceholder': 'jane.doe@example.com',
    'booking.studentIdLabel': 'Student ID number',
    'booking.studentIdPlaceholder': '1234567',
    'booking.topicLabel': 'Topic / reason',
    'booking.topicPlaceholder': 'Brief description of your topic ...',
    'booking.submitting': 'Booking ...',
    'booking.submit': 'Book now',
    'myBookings.title': 'My bookings',
    'myBookings.description': 'Enter your student ID number to view bookings or confirm a cancellation by email.',
    'myBookings.placeholder': 'Student ID number (6-8 digits)',
    'myBookings.inputAria': 'Enter student ID number',
    'myBookings.searching': 'Searching ...',
    'myBookings.search': 'Search',
    'myBookings.emptyTitle': 'No bookings found',
    'myBookings.emptyText': 'There are no bookings for this student ID number.',
    'myBookings.bookingSingular': 'booking',
    'myBookings.bookingPlural': 'bookings',
    'myBookings.foundSuffix': 'found:',
    'myBookings.reasonLabel': 'Reason',
    'myBookings.cancelAriaPrefix': 'Cancel booking on',
    'myBookings.cancelAriaSuffix': '',
    'myBookings.cancelling': 'Sending email ...',
    'myBookings.cancel': 'Cancel',
    'myBookings.cancelEmailSent': 'We sent a confirmation email. The booking will only be cancelled after you open the link in that email.',
    'myBookings.cancelEmailQueued': 'The cancellation request was prepared. Email sending is not configured yet.',
    'myBookings.cancelFallback': 'Cancellation failed.',
    'cancelConfirm.loading': 'Confirming cancellation ...',
    'cancelConfirm.successTitle': 'Appointment cancelled',
    'cancelConfirm.successText': 'The booking has been removed. The slot is available again.',
    'cancelConfirm.errorTitle': 'Cancellation not possible',
    'cancelConfirm.errorText': 'This link is invalid or has already expired.',
    'cancelConfirm.homeLink': 'Book appointment',
    'cancelConfirm.myBookingsLink': 'My bookings',
    'errors.formInvalid': 'Please fill in all fields correctly.',
    'errors.unknownShort': 'Unknown error.',
    'errors.invalidMat': 'Please enter a valid student ID number (6-8 digits).',
    'errors.bookingMismatch': 'Booking not found or student ID number does not match.',
  },
} satisfies Record<AppLanguage, Record<string, string>>

export type TranslationKey = keyof typeof translations.de

function isLanguage(value: string | null): value is AppLanguage {
  return value === 'de' || value === 'en'
}

export function useLanguage() {
  const language = useState<AppLanguage>('app-language', () => 'de')
  const initialized = useState('app-language-initialized', () => false)

  if (import.meta.client && !initialized.value) {
    initialized.value = true
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) language.value = saved
  }

  if (import.meta.client) {
    watch(
      language,
      (value) => {
        localStorage.setItem(STORAGE_KEY, value)
        document.documentElement.lang = value
      },
      { immediate: true },
    )
  }

  const locale = computed(() => LOCALES[language.value])

  function t(key: TranslationKey): string {
    return translations[language.value][key] ?? translations.de[key]
  }

  function setLanguage(nextLanguage: AppLanguage): void {
    language.value = nextLanguage
  }

  function toggleLanguage(): void {
    language.value = language.value === 'de' ? 'en' : 'de'
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(locale.value, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: BERLIN_TZ,
    })
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString(locale.value, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: BERLIN_TZ,
    })
  }

  function formatTimeRange(startIso: string, endIso: string): string {
    const suffix = language.value === 'de' ? ' Uhr' : ''
    return `${formatTime(startIso)} - ${formatTime(endIso)}${suffix}`
  }

  return { language, t, setLanguage, toggleLanguage, formatDate, formatTime, formatTimeRange }
}
