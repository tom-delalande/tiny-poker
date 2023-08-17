-- migrate:up
CREATE TABLE event_logs (
    device_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    timestamp VARCHAR(20) NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    event_data TEXT NOT NULL
)

-- migrate:down
DROP TABLE event_logs;
