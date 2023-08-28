package landing

import (
	"net/http"
	"text/template"

	"github.com/go-chi/chi"
)

var tmpl = template.Must(template.ParseGlob("view/*.html"))

func LandingEndpoints(router chi.Router) chi.Router {
	router.Get("/", view)
	router.Get("/output.css", styles)
	return router
}

func styles(w http.ResponseWriter, r *http.Request) {
	styles := template.Must(template.ParseFiles("view/styles/output.css"))
	styles.Execute(w, nil)
}

func view(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(w, "index.html", nil)
}
