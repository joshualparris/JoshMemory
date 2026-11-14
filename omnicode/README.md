# OmniCode · The Polyglot Data Pipeline

> Every language. One living system.

Revived from the 12 December 2025 design. This is a *working prototype*, not an assertion that every programming language or 50 technologies are already integrated.

## What's actually implemented

The **local end-to-end audit** executes 9 real stages in one request:

| # | Executed language | Actual operation |
|---|---|---|
| 1 | Python 3 | Validate and normalise example email |
| 2 | Java 17+ | Extract email domain |
| 3 | C11 | Compute FNV-1a checksum |
| 4 | Perl | Mask local part |
| 5 | PHP CLI | Classify provider by known list (not a risk score) |
| 6 | AWK | Parse top-level domain label |
| 7 | JavaScript (Node.js 18+) | Compute demo SHA-256-derived fingerprint |
| 8 | Bash | Produce trace marker |
| 9 | Go 1.23+ | Orchestrate, apply timeouts and respond with JSON |

The **public browser playground** is a *separate lightweight Node.js-only demo*, because Vercel does not run the eight other local process executors. It reports `mode: hosted-node-demo` and `languagesExecuted: 1`. The local Go server reports `mode: polyglot-local` and `languagesExecuted: 9` only after completing all adapters.

This app is *not* a real login or authentication system and is intentionally stateless. Don't enter sensitive personal information.

## Run locally (Linux or WSL)

Install Go >=1.23, Python 3, Java JDK >=17, C compiler, Perl, PHP CLI, AWK, Node.js >=18 and Bash.

```bash
cd omnicode
bash scripts/build.sh
go test ./...
go run ./cmd/omnicode
```

Open http://localhost:8080 and run the example transaction. Test the API directly:

```bash
curl -fsS http://localhost:8080/api/health
curl -fsS -X POST http://localhost:8080/api/audit -H 'content-type: application/json' -d '{"email":"alex@example.com"}'
```

## Files

- `cmd/omnicode/` Go HTTP server and integration tests
- `services/` Java and C adapters
- `scripts/` Python, Perl, PHP, AWK, JavaScript and Bash adapters, build script
- `site/` responsive HTML/CSS/JavaScript dashboard and hosted-only Node functions
- `.github/workflows/omnicode.yml` CI regression coverage

## Milestones and definition of done

1. **Foundation (9 executed languages):** adapters execute in sequence, invalid data rejected, tests green, dashboard present.
2. **50 technologies:** add COBOL, Rust, Ruby, SQL, GraphQL, Docker, Kubernetes, Terraform, React, SASS and additional runtimes with actual useful features; each must execute and be tested to count. Technologies and languages must be tracked separately.
3. **100+ languages:** plug-in worker contract, reproducible isolated builds, sandboxing, per-language conformance test, independent provenance of each executable adapter, web orchestration dashboard.

### Known limits

- The full pipeline only runs where its local interpreters/compilers are installed; deployment of full Go process orchestration is **not** included in the Node-only Vercel demo.
- Demo email validation is deliberately narrower than full RFC 5322. The provider classification is not security/risk analysis.
- No database, authentication, logging, persistent audit ledger or sign-in functionality exists yet. FNV-1a and truncated SHA-256 outputs are demonstration fingerprints, not encryption.
- Target of "every programming language ever" is aspirational; the universe of languages is not fixed or precisely enumerable.

## Original provenance

The plan was recovered in `joshmemory-cloud/private-view/reconstructed-2025-post-export.md` in `joshualparris/JoshDashboard4` (12 December 2025). This code is a fresh implementation that preserves the polyglot pipeline concept.
