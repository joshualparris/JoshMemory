package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type stage struct {
	Language string `json:"language"`
	Action   string `json:"action"`
	Result   string `json:"result"`
}
type output struct {
	Mode              string  `json:"mode"`
	Email             string  `json:"email"`
	Masked            string  `json:"masked"`
	Domain            string  `json:"domain"`
	DomainClass       string  `json:"domainClass"`
	TLD               string  `json:"tld"`
	Marker            string  `json:"marker"`
	Fingerprint       string  `json:"fingerprint"`
	Checksum          string  `json:"checksum"`
	Stages            []stage `json:"stages"`
	LanguagesExecuted int     `json:"languagesExecuted"`
}

func projectRoot() string {
	dir, err := os.Getwd()
	if err != nil {
		return "."
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "."
		}
		dir = parent
	}
}
func worker(ctx context.Context, stdin string, prog string, args ...string) (string, error) {
	stageCtx, cancel := context.WithTimeout(ctx, 4*time.Second)
	defer cancel()
	cmd := exec.CommandContext(stageCtx, prog, args...)
	cmd.Dir = projectRoot()
	cmd.Stdin = strings.NewReader(stdin + "\n")
	b, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("%s stage failed: %w (%s)", prog, err, strings.TrimSpace(string(b)))
	}
	s := strings.TrimSpace(string(b))
	if len(s) > 512 || strings.Contains(s, "\n") {
		return "", errors.New("invalid adapter output")
	}
	return s, nil
}

func audit(ctx context.Context, email string) (output, error) {
	r := output{Mode: "polyglot-local", Stages: []stage{}}
	add := func(language, action, result string) { r.Stages = append(r.Stages, stage{language, action, result}) }
	canonical, err := worker(ctx, email, "python3", "scripts/validate.py")
	if err != nil {
		return r, err
	}
	r.Email = canonical
	add("Python", "Validate + normalise", "accepted")
	domain, err := worker(ctx, canonical, "java", "-cp", "build/java", "Domain")
	if err != nil {
		return r, err
	}
	r.Domain = domain
	add("Java", "Extract domain", domain)
	checksum, err := worker(ctx, canonical, "./build/checksum")
	if err != nil {
		return r, err
	}
	r.Checksum = checksum
	add("C", "Calculate FNV-1a checksum", checksum)
	masked, err := worker(ctx, canonical, "perl", "scripts/mask.pl")
	if err != nil {
		return r, err
	}
	r.Masked = masked
	add("Perl", "Mask local part", masked)
	group, err := worker(ctx, domain, "php", "scripts/classify.php")
	if err != nil {
		return r, err
	}
	r.DomainClass = group
	add("PHP", "Categorise provider", group)
	tld, err := worker(ctx, domain, "awk", "-f", "scripts/tld.awk")
	if err != nil {
		return r, err
	}
	r.TLD = tld
	add("AWK", "Parse top-level label", tld)
	fingerprint, err := worker(ctx, canonical, "node", "scripts/hash.mjs")
	if err != nil {
		return r, err
	}
	r.Fingerprint = fingerprint
	add("JavaScript (Node)", "Calculate demo fingerprint", fingerprint)
	marker, err := worker(ctx, tld, "bash", "scripts/marker.sh")
	if err != nil {
		return r, err
	}
	r.Marker = marker
	add("Bash", "Format audit marker", marker)
	add("Go", "Orchestrate + return JSON", "complete")
	r.LanguagesExecuted = len(r.Stages)
	return r, nil
}
func jsonReply(w http.ResponseWriter, status int, x any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(x)
}
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		jsonReply(w, 200, map[string]any{"ok": true, "mode": "polyglot-local", "languagesExecuted": 9})
	})
	mux.HandleFunc("POST /api/audit", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 2048)
		var req struct {
			Email string `json:"email"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			jsonReply(w, 400, map[string]string{"error": "Expected JSON with email"})
			return
		}
		result, err := audit(r.Context(), req.Email)
		if err != nil {
			jsonReply(w, 400, map[string]string{"error": "Email rejected or local stage unavailable; run scripts/build.sh and check runtimes"})
			return
		}
		jsonReply(w, 200, result)
	})
	mux.Handle("GET /", http.FileServer(http.Dir("site")))
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	srv := &http.Server{Addr: ":" + port, Handler: mux, ReadHeaderTimeout: 5 * time.Second, MaxHeaderBytes: 4096}
	log.Printf("OmniCode polyglot server listening on :%s", port)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
