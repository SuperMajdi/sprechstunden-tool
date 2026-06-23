-- ============================================================
-- Sprechstunden-Tool — Datenbankschema
-- Erstellt für Supabase (PostgreSQL)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. TABELLEN
-- ------------------------------------------------------------

-- Zeitslots: vom Admin verwaltet
CREATE TABLE IF NOT EXISTS slots (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  start_time timestamptz NOT NULL,
  end_time   timestamptz NOT NULL,
  is_locked  boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Slots dürfen sich nicht überschneiden (benötigt btree_gist extension)
  CONSTRAINT slots_no_overlap EXCLUDE USING gist (
    tstzrange(start_time, end_time, '[)') WITH &&
  ),
  -- Logische Konsistenz: end_time muss nach start_time liegen
  CONSTRAINT slots_time_order CHECK (end_time > start_time)
);

-- Buchungen: von Studierenden erstellt
CREATE TABLE IF NOT EXISTS bookings (
  id              uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id         uuid  NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  student_name    text  NOT NULL CHECK (char_length(student_name) >= 2),
  student_email   text  NOT NULL,
  matrikelnummer  text  NOT NULL CHECK (matrikelnummer ~ '^\d{6,8}$'),
  anliegen        text  NOT NULL CHECK (char_length(anliegen) >= 5),
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- KRITISCH: Verhindert Doppelbuchung auf Datenbankebene.
  -- Kein Frontend-Check kann das ersetzen — race conditions werden
  -- durch diesen Constraint zuverlässig ausgeschlossen.
  CONSTRAINT bookings_one_per_slot UNIQUE (slot_id),
  CONSTRAINT bookings_student_email_format
    CHECK (student_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

-- Migration helper for existing projects that already created bookings before
-- email verification was added. Fresh installs get the NOT NULL column above.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS student_email text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_student_email_format'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_student_email_format
      CHECK (student_email IS NULL OR student_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');
  END IF;
END $$;

-- Einmal-Token für E-Mail-bestätigte Stornierungen
CREATE TABLE IF NOT EXISTS booking_cancellation_tokens (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid       NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  token_hash text       NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT booking_cancellation_tokens_hash_format
    CHECK (token_hash ~ '^[0-9a-f]{64}$')
);

-- Index für schnelle Suche nach Matrikelnummer (z. B. "Meine Buchungen")
CREATE INDEX IF NOT EXISTS bookings_matrikelnummer_idx
  ON bookings (matrikelnummer);

CREATE INDEX IF NOT EXISTS booking_cancellation_tokens_booking_idx
  ON booking_cancellation_tokens (booking_id);

CREATE INDEX IF NOT EXISTS booking_cancellation_tokens_expires_idx
  ON booking_cancellation_tokens (expires_at);

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
-- Sicherheitsmodell:
--   - Anon (Studierende): Slots lesen; Buchungen anlegen (via RPC).
--     Kein direkter SELECT auf bookings — verhindert Auslesen fremder Daten.
--   - Authenticated (Admin): Voller Zugriff auf alles.
-- Das anon-Key ist im Frontend sichtbar, aber RLS stellt sicher, dass
-- ein Angreifer damit keine fremden Buchungen lesen/löschen kann.

ALTER TABLE slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_cancellation_tokens ENABLE ROW LEVEL SECURITY;

-- Slots: Jeder darf lesen, nur Admins dürfen schreiben
CREATE POLICY "slots_select_public"
  ON slots FOR SELECT
  USING (true);

CREATE POLICY "slots_insert_admin"
  ON slots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "slots_update_admin"
  ON slots FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "slots_delete_admin"
  ON slots FOR DELETE
  USING (auth.role() = 'authenticated');

-- Bookings: Admins lesen alles; anon darf NICHT direkt lesen
-- (Lesezugriff für Studierende erfolgt ausschließlich über die sichere
--  get_my_bookings() Funktion mit SECURITY DEFINER)
CREATE POLICY "bookings_select_admin"
  ON bookings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Direktes INSERT von anon ist NICHT erlaubt.
-- Buchungen werden über die book_slot()-Funktion angelegt (SECURITY DEFINER).
-- Das schützt vor Manipulation: kein Client kann beliebige Werte einfügen.
-- (Kein bookings_insert_anon Policy nötig — book_slot() übernimmt das)

-- ------------------------------------------------------------
-- 3. HILFSFUNKTIONEN (SECURITY DEFINER)
-- Diese Funktionen laufen mit den Rechten des Funktionserstellers (postgres),
-- nicht mit denen des aufrufenden anon-Nutzers.
-- So können Studierende ihre eigenen Daten lesen/löschen,
-- ohne direkten Zugriff auf die bookings-Tabelle zu haben.
-- ------------------------------------------------------------

-- 3a. Alle Slots inkl. Buchungsstatus (boolean) für die Studierenden-Ansicht.
--     Gibt NUR is_booked zurück, nicht wer gebucht hat — Datenschutz.
CREATE OR REPLACE FUNCTION get_slots_with_status()
RETURNS TABLE (
  id         uuid,
  start_time timestamptz,
  end_time   timestamptz,
  is_locked  boolean,
  created_at timestamptz,
  is_booked  boolean
)
SECURITY DEFINER
LANGUAGE sql
STABLE  -- reine Lesefunktion, kein Seiteneffekt
AS $$
  SELECT
    s.id,
    s.start_time,
    s.end_time,
    s.is_locked,
    s.created_at,
    EXISTS (
      SELECT 1 FROM bookings b WHERE b.slot_id = s.id
    ) AS is_booked
  FROM slots s
  WHERE s.start_time >= now()   -- nur zukünftige Slots
  ORDER BY s.start_time;
$$;

-- 3b. Atomares Buchen eines Slots.
--     Prüft: Slot vorhanden, nicht gesperrt.
--     Das UNIQUE-Constraint (bookings_one_per_slot) verhindert
--     Doppelbuchungen auch bei gleichzeitigen Anfragen.
DROP FUNCTION IF EXISTS book_slot(uuid, text, text, text);

CREATE OR REPLACE FUNCTION book_slot(
  p_slot_id        uuid,
  p_student_name   text,
  p_student_email  text,
  p_matrikelnummer text,
  p_anliegen       text
)
RETURNS uuid
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_locked  boolean;
  v_booking_id uuid;
BEGIN
  -- Slot sperren (FOR UPDATE) um Race Conditions zu minimieren
  SELECT is_locked
  INTO   v_is_locked
  FROM   slots
  WHERE  id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'slot_not_found';
  END IF;

  IF v_is_locked THEN
    RAISE EXCEPTION 'slot_locked';
  END IF;

  IF p_student_email IS NULL
     OR p_student_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;

  -- Buchung einfügen; UNIQUE-Constraint wirft Fehler bei Doppelbuchung
  INSERT INTO bookings (slot_id, student_name, student_email, matrikelnummer, anliegen)
  VALUES (
    p_slot_id,
    btrim(p_student_name),
    lower(btrim(p_student_email)),
    btrim(p_matrikelnummer),
    btrim(p_anliegen)
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'slot_unavailable';
END;
$$;

-- 3c. Eigene Buchungen eines Studierenden anzeigen (per Matrikelnummer).
CREATE OR REPLACE FUNCTION get_my_bookings(p_matrikelnummer text)
RETURNS TABLE (
  id              uuid,
  slot_id         uuid,
  student_name    text,
  anliegen        text,
  created_at      timestamptz,
  slot_start_time timestamptz,
  slot_end_time   timestamptz
)
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
  SELECT
    b.id,
    b.slot_id,
    b.student_name,
    b.anliegen,
    b.created_at,
    s.start_time AS slot_start_time,
    s.end_time   AS slot_end_time
  FROM bookings b
  JOIN slots    s ON b.slot_id = s.id
  WHERE b.matrikelnummer = p_matrikelnummer
  ORDER BY s.start_time;
$$;

-- 3d. Stornierung anfordern: erzeugt einen kurzlebigen Token und gibt die
--     E-Mail-Adresse nur an die Edge Function zurück, die die Mail versendet.
DROP FUNCTION IF EXISTS cancel_my_booking(uuid, text);

CREATE OR REPLACE FUNCTION request_booking_cancellation(
  p_booking_id     uuid,
  p_matrikelnummer text,
  p_token_hash     text
)
RETURNS TABLE (
  success         boolean,
  student_email   text,
  student_name    text,
  slot_start_time timestamptz,
  slot_end_time   timestamptz
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_email text;
  v_name  text;
  v_start timestamptz;
  v_end   timestamptz;
BEGIN
  IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid_cancellation_token';
  END IF;

  DELETE FROM booking_cancellation_tokens
  WHERE expires_at < now()
     OR used_at IS NOT NULL;

  SELECT b.student_email, b.student_name, s.start_time, s.end_time
  INTO   v_email, v_name, v_start, v_end
  FROM bookings b
  JOIN slots s ON s.id = b.slot_id
  WHERE b.id = p_booking_id
    AND b.matrikelnummer = p_matrikelnummer;

  IF NOT FOUND OR v_email IS NULL THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::timestamptz, NULL::timestamptz;
    RETURN;
  END IF;

  DELETE FROM booking_cancellation_tokens
  WHERE booking_id = p_booking_id;

  INSERT INTO booking_cancellation_tokens (booking_id, token_hash, expires_at)
  VALUES (p_booking_id, p_token_hash, now() + interval '30 minutes');

  RETURN QUERY SELECT true, v_email, v_name, v_start, v_end;
END;
$$;

-- 3e. Stornierung bestätigen: nur der Link aus der E-Mail enthält den Token.
CREATE OR REPLACE FUNCTION confirm_booking_cancellation(p_token_hash text)
RETURNS TABLE (
  success         boolean,
  slot_start_time timestamptz,
  slot_end_time   timestamptz
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking_id uuid;
  v_start      timestamptz;
  v_end        timestamptz;
  v_deleted    integer := 0;
BEGIN
  IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN QUERY SELECT false, NULL::timestamptz, NULL::timestamptz;
    RETURN;
  END IF;

  SELECT t.booking_id, s.start_time, s.end_time
  INTO   v_booking_id, v_start, v_end
  FROM booking_cancellation_tokens t
  JOIN bookings b ON b.id = t.booking_id
  JOIN slots s    ON s.id = b.slot_id
  WHERE t.token_hash = p_token_hash
    AND t.used_at IS NULL
    AND t.expires_at >= now()
  FOR UPDATE OF t;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::timestamptz, NULL::timestamptz;
    RETURN;
  END IF;

  UPDATE booking_cancellation_tokens
  SET used_at = now()
  WHERE token_hash = p_token_hash;

  DELETE FROM bookings
  WHERE id = v_booking_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN QUERY SELECT (v_deleted > 0), v_start, v_end;
END;
$$;

-- ------------------------------------------------------------
-- 4. GRANT: Anon darf die RPC-Funktionen aufrufen
-- ------------------------------------------------------------
GRANT EXECUTE ON FUNCTION get_slots_with_status()     TO anon;
GRANT EXECUTE ON FUNCTION book_slot(uuid, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION get_my_bookings(text)       TO anon;
GRANT EXECUTE ON FUNCTION request_booking_cancellation(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION confirm_booking_cancellation(text) TO anon;

-- Admins brauchen direkten Tabellenzugriff für Verwaltung
GRANT ALL ON slots                       TO authenticated;
GRANT ALL ON bookings                    TO authenticated;
GRANT ALL ON booking_cancellation_tokens TO authenticated;
