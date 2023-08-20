SELECT "Unique sessions in last 24 hours";
SELECT COUNT(DISTINCT(session_id)) FROM event_logs WHERE timestamp > datetime('now', '-24 hour');
