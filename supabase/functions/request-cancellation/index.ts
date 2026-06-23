import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type AppLanguage = 'de' | 'en'

type CancellationRequestRow = {
  success: boolean
  student_email: string | null
  student_name: string | null
  slot_start_time: string | null
  slot_end_time: string | null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const matrikelRe = /^\d{6,8}$/

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405)
  }

  try {
    const body = await request.json().catch(() => null)
    const bookingId = typeof body?.bookingId === 'string' ? body.bookingId : ''
    const matrikelnummer = typeof body?.matrikelnummer === 'string' ? body.matrikelnummer.trim() : ''
    const language: AppLanguage = body?.language === 'en' ? 'en' : 'de'

    if (!uuidRe.test(bookingId) || !matrikelRe.test(matrikelnummer)) {
      return json({ success: false, message: message(language, 'invalid') }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('missing_supabase_function_secrets')
    }

    const token = createToken()
    const tokenHash = await sha256Hex(token)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { data, error } = await supabase
      .rpc('request_booking_cancellation', {
        p_booking_id: bookingId,
        p_matrikelnummer: matrikelnummer,
        p_token_hash: tokenHash,
      })
      .single<CancellationRequestRow>()

    if (error) throw error

    if (!data?.success || !data.student_email || !data.slot_start_time || !data.slot_end_time) {
      return json({ success: false, message: message(language, 'notFound') }, 404)
    }

    const siteUrl = getSiteUrl(request)
    if (!siteUrl) throw new Error('missing_public_site_url')

    const confirmationUrl = `${siteUrl}/stornierung-bestaetigen?token=${encodeURIComponent(token)}`
    const emailSent = await sendCancellationEmail({
      to: data.student_email,
      studentName: data.student_name ?? '',
      slotStartTime: data.slot_start_time,
      slotEndTime: data.slot_end_time,
      confirmationUrl,
      language,
    })

    return json({ success: true, emailSent })
  } catch (error) {
    console.error('request-cancellation failed', error)
    return json({ success: false, message: 'Cancellation email could not be sent.' }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function message(language: AppLanguage, key: 'invalid' | 'notFound'): string {
  const messages = {
    de: {
      invalid: 'Ungueltige Anfrage.',
      notFound: 'Buchung nicht gefunden oder Matrikelnummer stimmt nicht ueberein.',
    },
    en: {
      invalid: 'Invalid request.',
      notFound: 'Booking not found or student ID number does not match.',
    },
  }
  return messages[language][key]
}

function createToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let raw = ''
  for (const byte of bytes) raw += String.fromCharCode(byte)
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function getSiteUrl(request: Request): string {
  const configured = Deno.env.get('PUBLIC_SITE_URL')
  const origin = request.headers.get('origin')
  return (configured || origin || '').replace(/\/$/, '')
}

async function sendCancellationEmail(args: {
  to: string
  studentName: string
  slotStartTime: string
  slotEndTime: string
  confirmationUrl: string
  language: AppLanguage
}): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    return false
  }

  const slotLabel = formatSlot(args.slotStartTime, args.slotEndTime, args.language)
  const subject = args.language === 'de'
    ? 'Stornierung Ihres Sprechstundentermins bestaetigen'
    : 'Confirm your consultation cancellation'
  const greeting = args.studentName
    ? (args.language === 'de' ? `Hallo ${args.studentName},` : `Hello ${args.studentName},`)
    : (args.language === 'de' ? 'Hallo,' : 'Hello,')
  const text = args.language === 'de'
    ? `${greeting}\n\nbitte bestaetigen Sie die Stornierung Ihres Sprechstundentermins am ${slotLabel}:\n\n${args.confirmationUrl}\n\nDer Link ist 30 Minuten gueltig. Wenn Sie die Stornierung nicht angefordert haben, ignorieren Sie diese E-Mail bitte.`
    : `${greeting}\n\nplease confirm the cancellation of your consultation appointment on ${slotLabel}:\n\n${args.confirmationUrl}\n\nThis link is valid for 30 minutes. If you did not request this cancellation, please ignore this email.`
  const html = `
    <p>${escapeHtml(greeting)}</p>
    <p>${args.language === 'de'
      ? `Bitte bestaetigen Sie die Stornierung Ihres Sprechstundentermins am <strong>${escapeHtml(slotLabel)}</strong>.`
      : `Please confirm the cancellation of your consultation appointment on <strong>${escapeHtml(slotLabel)}</strong>.`
    }</p>
    <p><a href="${escapeHtml(args.confirmationUrl)}">${args.language === 'de' ? 'Stornierung bestaetigen' : 'Confirm cancellation'}</a></p>
    <p>${args.language === 'de'
      ? 'Der Link ist 30 Minuten gueltig. Wenn Sie die Stornierung nicht angefordert haben, ignorieren Sie diese E-Mail bitte.'
      : 'This link is valid for 30 minutes. If you did not request this cancellation, please ignore this email.'
    }</p>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('CANCELLATION_FROM_EMAIL') || 'Sprechstunden <onboarding@resend.dev>',
      to: args.to,
      subject,
      text,
      html,
    }),
  })

  if (!response.ok) {
    throw new Error(`resend_failed:${await response.text()}`)
  }

  return true
}

function formatSlot(startIso: string, endIso: string, language: AppLanguage): string {
  const locale = language === 'de' ? 'de-DE' : 'en-GB'
  const start = new Date(startIso)
  const end = new Date(endIso)
  const date = start.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
  })
  const startTime = start.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  })
  const endTime = end.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  })
  return language === 'de' ? `${date}, ${startTime} - ${endTime} Uhr` : `${date}, ${startTime} - ${endTime}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
