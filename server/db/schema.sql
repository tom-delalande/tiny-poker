CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE event_logs (
    device_id TEXT NOT NULL,
    timestamp VARCHAR(20) NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    event_data TEXT NOT NULL
);
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20230815143200');
