# CREDENTIALS.md
# Zugangsdaten für die Bewertung
# Diese Datei wird ins Repository committet (enthält die Test-Zugangsdaten).

## Supabase-Projekt
- **URL:** `https://biqhfhlktzhldvtsdusg.supabase.co`
- **Anon Key:** `eyJh...` (siehe .env.submit)
 


## Admin-Login (für /admin/login)
- **E-Mail:** `admin@hotmail.com`
- **Passwort:** `2468tfhb`

## Testdaten
Nach Ausführung von `supabase/seed.sql` sind 8 Slots vorhanden,
davon einer gesperrt. Eine Test-Buchung kann mit folgenden Daten
nachvollzogen werden:
- Name: `Erika Muster`
- E-Mail: `erika.muster@example.com`
- Matrikelnummer: `1234567`
- Anliegen: `Frage zur Abschlussarbeit`

Buchungsübersicht abrufbar unter `/meine-buchungen` mit Matrikelnummer `1234567`.
