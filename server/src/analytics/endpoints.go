package analytics

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
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
		sessionId := int(event["sessionId"].(float64))
		timestamp := event["timestamp"]
		eventType := event["eventType"]
		event["serverBuildVersion"] = os.Getenv("BUILD_VERSION")

		if deviceId == nil || timestamp == nil || eventType == nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		eventData, err := json.Marshal(event)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = db.Exec(`
			INSERT INTO event_logs (
				device_id,
				session_id,
				timestamp,
				event_type,
				event_data
			) VALUES ($1, $2, $3, $4, $5)
		`, deviceId, sessionId, timestamp, eventType, eventData)

		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	})
	return router
}
