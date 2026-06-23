-- Seed: Test-Slots für die Entwicklung
-- Läuft NUR in lokaler Entwicklungsumgebung, nicht in Produktion.

-- Erstellt 8 Slots in der nächsten Woche (immer ab morgen +3 Tage)
INSERT INTO slots (start_time, end_time) VALUES
  (now() + interval '3 days' + interval '10 hours',  now() + interval '3 days' + interval '10 hours 30 minutes'),
  (now() + interval '3 days' + interval '10 hours 30 minutes', now() + interval '3 days' + interval '11 hours'),
  (now() + interval '3 days' + interval '11 hours',  now() + interval '3 days' + interval '11 hours 30 minutes'),
  (now() + interval '3 days' + interval '14 hours',  now() + interval '3 days' + interval '14 hours 30 minutes'),
  (now() + interval '5 days' + interval '09 hours',  now() + interval '5 days' + interval '09 hours 30 minutes'),
  (now() + interval '5 days' + interval '09 hours 30 minutes', now() + interval '5 days' + interval '10 hours'),
  (now() + interval '5 days' + interval '10 hours',  now() + interval '5 days' + interval '10 hours 30 minutes'),
  (now() + interval '7 days' + interval '14 hours',  now() + interval '7 days' + interval '14 hours 30 minutes');

-- Einen Slot sperren (als Beispiel)
UPDATE slots
SET is_locked = true
WHERE start_time = (SELECT start_time FROM slots ORDER BY start_time LIMIT 1 OFFSET 2);
