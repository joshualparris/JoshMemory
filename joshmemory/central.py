from __future__ import annotations

import argparse
import contextvars
import hmac
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib import error, request

from .paths import default_db_path

MAX_BODY_BYTES = 1_048_576
_SERVER_CALL = contextvars.ContextVar("joshmemory_central_server_call", default=False)


class CentralMemoryError(RuntimeError):
    """Raised when the configured central JoshMemory service cannot serve a request."""


def in_server_call() -> bool:
    """True only while the central HTTP service is executing a storage operation."""
    return bool(_SERVER_CALL.get())


def remote_url() -> str:
    return os.environ.get("JOSHMEMORY_REMOTE_URL", "").strip().rstrip("/")


def github_store_enabled() -> bool:
    if in_server_call():
        return False
    from .github_store import enabled

    return enabled()


def remote_enabled() -> bool:
    if in_server_call():
        return False
    return bool(remote_url()) or github_store_enabled()


def storage_mode() -> str:
    if in_server_call():
        return "local"
    if remote_url():
        return "http"
    if github_store_enabled():
        return "github"
    return "local"


def _token() -> str:
    return os.environ.get("JOSHMEMORY_TOKEN", "")


def remote_call(operation: str, arguments: dict[str, Any], *, timeout: float | None = None) -> Any:
    """Call the configured shared-memory backend.

    HTTP central service remains highest priority when JOSHMEMORY_REMOTE_URL is
    configured. Otherwise, an already-authenticated GitHub client automatically
    uses the private GitHub cloud store. There is deliberately no silent fallback
    after a shared backend has been selected: failed writes/reads are surfaced so
    the fleet cannot split into divergent memory stores unnoticed.
    """
    base = remote_url()
    if not base:
        from .github_store import GitHubStoreError, cloud_call, enabled

        if not enabled():
            raise CentralMemoryError("No shared JoshMemory backend is available")
        try:
            return cloud_call(operation, arguments)
        except GitHubStoreError as exc:
            raise CentralMemoryError(str(exc)) from exc

    body = json.dumps({"operation": operation, "arguments": arguments}, ensure_ascii=False).encode("utf-8")
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    token = _token()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = request.Request(f"{base}/v1/call", data=body, headers=headers, method="POST")
    timeout_value = timeout if timeout is not None else float(os.environ.get("JOSHMEMORY_REMOTE_TIMEOUT", "10"))
    try:
        with request.urlopen(req, timeout=timeout_value) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("error", str(exc))
        except Exception:
            detail = str(exc)
        raise CentralMemoryError(f"central JoshMemory HTTP {exc.code}: {detail}") from exc
    except (error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        raise CentralMemoryError(f"central JoshMemory unavailable: {exc}") from exc

    if not payload.get("ok"):
        raise CentralMemoryError(str(payload.get("error") or "central JoshMemory request failed"))
    return payload.get("result")


def _dispatch_local(operation: str, arguments: dict[str, Any], db_path: str) -> Any:
    from .facts import (
        accountability_reference_add,
        accountability_reference_search,
        project_fact_add,
        project_fact_search,
    )
    from .handoff import get_latest_handoff, list_handoffs, save_handoff

    marker = _SERVER_CALL.set(True)
    try:
        if operation == "save_handoff":
            return save_handoff(
                db_path,
                str(arguments["project"]),
                dict(arguments["handoff"]),
                machine=arguments.get("machine"),
                agent=arguments.get("agent"),
                source_type=str(arguments.get("source_type") or "agent_handoff"),
                source_ref=arguments.get("source_ref"),
                canonical_repo=arguments.get("canonical_repo") or "",
                checkout_path=arguments.get("checkout_path") or "",
            )
        if operation == "get_latest_handoff":
            return get_latest_handoff(
                db_path,
                str(arguments["project"]),
                machine=arguments.get("machine"),
                canonical_repo=arguments.get("canonical_repo"),
                checkout_path=arguments.get("checkout_path"),
                strict_checkout=bool(arguments.get("strict_checkout", False)),
            )
        if operation == "list_handoffs":
            return list_handoffs(
                db_path,
                str(arguments["project"]),
                machine=arguments.get("machine"),
                limit=int(arguments.get("limit", 10)),
                active_only=bool(arguments.get("active_only", False)),
                canonical_repo=arguments.get("canonical_repo"),
                checkout_path=arguments.get("checkout_path"),
            )
        if operation == "project_fact_add":
            return project_fact_add(
                db_path,
                project=str(arguments["project"]),
                subject=str(arguments["subject"]),
                fact=str(arguments["fact"]),
                status=str(arguments["status"]),
                confidence=arguments.get("confidence"),
                observed_at=arguments.get("observed_at"),
                source_type=arguments.get("source_type"),
                source_ref=arguments.get("source_ref"),
                machine=arguments.get("machine"),
                supersedes=arguments.get("supersedes"),
                canonical_repo=arguments.get("canonical_repo") or "",
                checkout_path=arguments.get("checkout_path") or "",
            )
        if operation == "project_fact_search":
            return project_fact_search(
                db_path,
                query=str(arguments["query"]),
                project=arguments.get("project"),
                active_only=bool(arguments.get("active_only", True)),
            )
        if operation == "accountability_reference_add":
            return accountability_reference_add(
                db_path,
                project=str(arguments["project"]),
                claim_summary=str(arguments["claim_summary"]),
                source_system=str(arguments["source_system"]),
                source_id=str(arguments["source_id"]),
                requirement_id=arguments.get("requirement_id"),
                source_ref=arguments.get("source_ref"),
                reviewer=arguments.get("reviewer"),
                verdict=arguments.get("verdict"),
                commit_sha=arguments.get("commit_sha"),
                supersedes=arguments.get("supersedes"),
            )
        if operation == "accountability_reference_search":
            return accountability_reference_search(
                db_path,
                query=str(arguments["query"]),
                project=arguments.get("project"),
                active_only=bool(arguments.get("active_only", True)),
            )
        raise ValueError(f"unsupported central operation: {operation}")
    finally:
        _SERVER_CALL.reset(marker)


class JoshMemoryHTTPServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, server_address: tuple[str, int], db_path: str, token: str):
        super().__init__(server_address, JoshMemoryHandler)
        self.db_path = db_path
        self.auth_token = token


class JoshMemoryHandler(BaseHTTPRequestHandler):
    server: JoshMemoryHTTPServer

    def log_message(self, format: str, *args: Any) -> None:  # pragma: no cover - stdlib logging noise
        if os.environ.get("JOSHMEMORY_HTTP_LOG", "") == "1":
            super().log_message(format, *args)

    def _send(self, status: int, payload: dict[str, Any]) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self) -> None:
        if self.path == "/":
            self._send(
                200,
                {
                    "ok": True,
                    "service": "JoshMemory",
                    "mode": "central-shared-memory",
                    "message": "Shared project memory is online. API operations require authentication.",
                },
            )
            return
        if self.path == "/health":
            self._send(200, {"ok": True, "service": "joshmemory-central"})
            return
        self._send(404, {"ok": False, "error": "not found"})

    def do_POST(self) -> None:
        if self.path != "/v1/call":
            self._send(404, {"ok": False, "error": "not found"})
            return

        expected = self.server.auth_token
        supplied = self.headers.get("Authorization", "")
        if expected:
            wanted = f"Bearer {expected}"
            if not hmac.compare_digest(supplied, wanted):
                self._send(401, {"ok": False, "error": "unauthorised"})
                return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send(400, {"ok": False, "error": "invalid content length"})
            return
        if length <= 0 or length > MAX_BODY_BYTES:
            self._send(413 if length > MAX_BODY_BYTES else 400, {"ok": False, "error": "invalid request size"})
            return

        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            operation = str(payload["operation"])
            arguments = payload.get("arguments") or {}
            if not isinstance(arguments, dict):
                raise ValueError("arguments must be an object")
            result = _dispatch_local(operation, arguments, self.server.db_path)
        except (KeyError, TypeError, ValueError) as exc:
            self._send(400, {"ok": False, "error": str(exc)})
            return
        except Exception as exc:
            self._send(500, {"ok": False, "error": f"{type(exc).__name__}: {exc}"})
            return

        self._send(200, {"ok": True, "result": result})


def create_server(host: str, port: int, *, db_path: str | None = None, token: str | None = None) -> JoshMemoryHTTPServer:
    resolved_db = str(Path(db_path or os.environ.get("JOSHMEMORY_DB_PATH") or default_db_path()).expanduser())
    Path(resolved_db).parent.mkdir(parents=True, exist_ok=True)
    resolved_token = _token() if token is None else token

    loopback_hosts = {"127.0.0.1", "::1", "localhost"}
    if host not in loopback_hosts and not resolved_token:
        raise ValueError("JOSHMEMORY_TOKEN is required when the central service binds beyond loopback")

    return JoshMemoryHTTPServer((host, port), resolved_db, resolved_token)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the central JoshMemory shared-memory database service")
    parser.add_argument("--host", default=os.environ.get("JOSHMEMORY_BIND", "127.0.0.1"))
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT") or os.environ.get("JOSHMEMORY_PORT", "8765")),
    )
    parser.add_argument(
        "--db",
        default=os.environ.get("JOSHMEMORY_DB_PATH") or str(default_db_path()),
    )
    args = parser.parse_args()

    server = create_server(args.host, args.port, db_path=args.db)
    print(f"JoshMemory central service listening on {args.host}:{server.server_address[1]}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
