package landing

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

var tmpl = template.Must(template.ParseGlob("view/*.html"))
var css = template.Must(template.ParseGlob("view/styles/output.css"))
var workDir, _ = os.Getwd()
var filesDir = http.Dir(filepath.Join(workDir, "view/assets"))

func LandingEndpoints(router chi.Router) chi.Router {
	router.Use(middleware.Compress(5))
	router.Get("/", view)
	router.Get("/output.css", styles)
	router.Get("/assets/*", asset)
	return router
}

func styles(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "text/css")
	css.Execute(w, nil)
}

func asset(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Cache-Control", "max-age=31536000")
	rctx := chi.RouteContext(r.Context())
	pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
	fs := http.StripPrefix(pathPrefix, http.FileServer(filesDir))
	fs.ServeHTTP(w, r)
}

func view(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(w, "index.html", nil)
}
