package analytics

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi"
)

func AnalyticsEndpoints(router chi.Router, db *sql.DB) chi.Router {
	router.Post("/event", func(w http.ResponseWriter, r *http.Request) {
		var event map[string]interface{}
		err := json.NewDecoder(r.Body).Decode(&event)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		deviceId := event["deviceId"]
		sessionId := event["sessionId"]
		timestamp := event["timestamp"]
		eventType := event["eventType"]

		if deviceId == nil || timestamp == nil || eventType == nil || sessionId == nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		eventData, err := json.Marshal(event)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		db.Exec(`
			INSERT INTO event_logs (
				device_id,
				session_id,
				timestamp,
				event_type,
				event_data
			) VALUES ($1, $2, $3, $4)
		`, deviceId, timestamp, eventType, eventData)
	})
	return router
}
