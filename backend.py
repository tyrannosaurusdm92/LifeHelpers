from __future__ import annotations

"""
Lord Onyx Blepman backend
Upgrade-ready standard-library backend for the merged Onyx app.

Run:
    python backend.py
    python backend

Environment highlights:
    ONYX_HOST=127.0.0.1
    ONYX_PORT=7869
    ONYX_DB_PATH=data/onyx_memory.sqlite3
    OPENAI_API_KEY=...
    OPENAI_BASE_URL=https://api.openai.com/v1
    OPENAI_MODEL=gpt-4.1 / gpt-5.5-thinking compatible future model name
    OLLAMA_BASE_URL=http://127.0.0.1:11434
    OLLAMA_MODEL=llama3.1

Design promise:
    Every API path and expected action returns a safe JSON envelope, even on errors.
    The browser should never need to parse HTML error pages from this backend.
"""

import hashlib
import html
import json
import mimetypes
import os
import re
import sqlite3
import sys
import time
import traceback
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Callable
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
DATA_DIR = ROOT / "data"
DEFAULT_DB = DATA_DIR / "onyx_memory.sqlite3"
PROMPT_PATH = ROOT / "prompts" / "onyx_system_prompt.md"

# Let this file import the existing merged app brain when it lives beside it.
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from onyx_brain import OnyxBrain  # type: ignore
except Exception:  # pragma: no cover - safe fallback path
    OnyxBrain = None  # type: ignore

try:
    from onyx_brain.llm_adapters import call_ollama, call_openai_compatible  # type: ignore
except Exception:  # pragma: no cover - safe fallback path
    call_ollama = None  # type: ignore
    call_openai_compatible = None  # type: ignore


# ---------------------------------------------------------------------------
# Safe JSON envelope
# ---------------------------------------------------------------------------

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_error(code: str, message: str, details: Any | None = None) -> dict[str, Any]:
    return {
        "code": str(code or "error"),
        "message": str(message or "Something went wrong."),
        "details": details if details is not None else {},
    }


def safe_json(
    *,
    action: str,
    ok: bool,
    data: Any | None = None,
    error: dict[str, Any] | None = None,
    warnings: list[str] | None = None,
    fallback_used: bool = False,
    status_code: int = 200,
    request_id: str | None = None,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """One envelope shape for every expected backend response."""
    return {
        "ok": bool(ok),
        "action": str(action or "unknown"),
        "data": data if data is not None else {},
        "error": error,
        "warnings": warnings or [],
        "fallback_used": bool(fallback_used),
        "status_code": int(status_code),
        "request_id": request_id or uuid.uuid4().hex,
        "timestamp": now_iso(),
        "backend": {
            "name": "Lord Onyx Blepman Backend",
            "version": "3.0-safe-json-sqlite-rag-router-tools",
        },
        "meta": meta or {},
    }


def safe_result(action: str, func: Callable[[], Any], *, request_id: str | None = None) -> dict[str, Any]:
    try:
        data = func()
        if isinstance(data, dict) and set(data.keys()) >= {"ok", "action", "data", "error"}:
            # Already an envelope.
            data.setdefault("request_id", request_id or uuid.uuid4().hex)
            return data
        return safe_json(action=action, ok=True, data=data, request_id=request_id)
    except Exception as exc:
        details = {
            "exception": exc.__class__.__name__,
            "trace_tail": traceback.format_exc(limit=5).splitlines()[-12:],
        }
        return safe_json(
            action=action,
            ok=False,
            data={"reply": emergency_fallback_reply(action), "mood": "caring"},
            error=make_error("BACKEND_ACTION_FAILED", str(exc), details),
            warnings=["Onyx caught the backend error and returned safe JSON instead of crashing."],
            fallback_used=True,
            status_code=500,
            request_id=request_id,
        )


def emergency_fallback_reply(action: str = "chat") -> str:
    if action == "chat":
        return (
            "Tiny void emergency fallback engaged. Onyx did not vanish; the backend tripped over a wire, "
            "so I am answering from the bookshelf bunker. Tell me the next tiny thing, and I will keep paws on the problem."
        )
    return "Onyx caught that safely and stayed awake. The void refuses to hard-crash."


# ---------------------------------------------------------------------------
# SQLite memory and RAG
# ---------------------------------------------------------------------------

def connect_db(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(path), timeout=30, check_same_thread=False)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA synchronous=NORMAL")
    con.execute("PRAGMA foreign_keys=ON")
    return con


class SQLiteMemory:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.con = connect_db(db_path)
        self._init_schema()

    def _init_schema(self) -> None:
        self.con.executescript(
            """
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                profile TEXT NOT NULL DEFAULT 'papa',
                title TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                mood TEXT DEFAULT '',
                risk TEXT DEFAULT '',
                provider TEXT DEFAULT '',
                meta_json TEXT DEFAULT '{}',
                created_at TEXT NOT NULL,
                FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                profile TEXT NOT NULL DEFAULT 'shared',
                kind TEXT NOT NULL DEFAULT 'note',
                key TEXT NOT NULL DEFAULT '',
                value TEXT NOT NULL,
                importance INTEGER NOT NULL DEFAULT 3,
                tags TEXT NOT NULL DEFAULT '',
                source TEXT NOT NULL DEFAULT 'manual',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
            CREATE INDEX IF NOT EXISTS idx_memories_profile_kind ON memories(profile, kind);
            CREATE INDEX IF NOT EXISTS idx_memories_key ON memories(key);
            """
        )
        self.con.commit()

    def ensure_conversation(self, conversation_id: str | None, profile: str = "papa", title: str = "") -> str:
        cid = (conversation_id or "").strip() or uuid.uuid4().hex
        now = now_iso()
        self.con.execute(
            """
            INSERT INTO conversations(id, profile, title, created_at, updated_at)
            VALUES(?,?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET profile=excluded.profile, updated_at=excluded.updated_at
            """,
            (cid, profile, title[:120], now, now),
        )
        self.con.commit()
        return cid

    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        *,
        mood: str = "",
        risk: str = "",
        provider: str = "",
        meta: dict[str, Any] | None = None,
    ) -> str:
        mid = uuid.uuid4().hex
        self.con.execute(
            """
            INSERT INTO messages(id, conversation_id, role, content, mood, risk, provider, meta_json, created_at)
            VALUES(?,?,?,?,?,?,?,?,?)
            """,
            (mid, conversation_id, role, content, mood, risk, provider, json.dumps(meta or {}, ensure_ascii=False), now_iso()),
        )
        self.con.execute("UPDATE conversations SET updated_at=? WHERE id=?", (now_iso(), conversation_id))
        self.con.commit()
        return mid

    def recent_history(self, conversation_id: str, limit: int = 18) -> list[dict[str, str]]:
        rows = self.con.execute(
            """
            SELECT role, content FROM messages
            WHERE conversation_id=?
            ORDER BY created_at DESC LIMIT ?
            """,
            (conversation_id, int(limit)),
        ).fetchall()
        out = [{"role": r["role"], "content": r["content"]} for r in reversed(rows)]
        return out

    def save_memory(
        self,
        value: str,
        *,
        profile: str = "shared",
        kind: str = "note",
        key: str = "",
        importance: int = 3,
        tags: str | list[str] = "",
        source: str = "manual",
    ) -> dict[str, Any]:
        value = str(value or "").strip()
        if not value:
            raise ValueError("Cannot save an empty memory.")
        mid = uuid.uuid4().hex
        tag_text = ",".join(tags) if isinstance(tags, list) else str(tags or "")
        now = now_iso()
        self.con.execute(
            """
            INSERT INTO memories(id, profile, kind, key, value, importance, tags, source, created_at, updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?)
            """,
            (mid, profile or "shared", kind or "note", key or "", value, int(importance), tag_text, source or "manual", now, now),
        )
        self.con.commit()
        return {"id": mid, "profile": profile, "kind": kind, "key": key, "value": value, "importance": int(importance), "tags": tag_text}

    def search_memories(self, query: str, *, profile: str = "shared", limit: int = 8) -> list[dict[str, Any]]:
        q = f"%{query.strip()}%" if query.strip() else "%"
        params: tuple[Any, ...]
        if profile and profile != "all":
            params = (profile, "shared", q, q, q, int(limit))
            sql = """
                SELECT * FROM memories
                WHERE (profile=? OR profile=?) AND (value LIKE ? OR key LIKE ? OR tags LIKE ?)
                ORDER BY importance DESC, updated_at DESC LIMIT ?
            """
        else:
            params = (q, q, q, int(limit))
            sql = """
                SELECT * FROM memories
                WHERE value LIKE ? OR key LIKE ? OR tags LIKE ?
                ORDER BY importance DESC, updated_at DESC LIMIT ?
            """
        rows = self.con.execute(sql, params).fetchall()
        return [dict(r) for r in rows]

    def export(self, limit_messages: int = 200) -> dict[str, Any]:
        convs = [dict(r) for r in self.con.execute("SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 50").fetchall()]
        msgs = [dict(r) for r in self.con.execute("SELECT * FROM messages ORDER BY created_at DESC LIMIT ?", (limit_messages,)).fetchall()]
        memories = [dict(r) for r in self.con.execute("SELECT * FROM memories ORDER BY updated_at DESC LIMIT 500").fetchall()]
        return {"conversations": convs, "messages": msgs, "memories": memories, "db_path": str(self.db_path)}


class RAGStore:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.con = connect_db(db_path)
        self.fts_available = False
        self._init_schema()

    def _init_schema(self) -> None:
        self.con.executescript(
            """
            CREATE TABLE IF NOT EXISTS rag_docs (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'manual',
                path TEXT NOT NULL DEFAULT '',
                tags TEXT NOT NULL DEFAULT '',
                sha256 TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS rag_chunks (
                id TEXT PRIMARY KEY,
                doc_id TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                title TEXT NOT NULL,
                text TEXT NOT NULL,
                tags TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                FOREIGN KEY(doc_id) REFERENCES rag_docs(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_rag_doc ON rag_chunks(doc_id, chunk_index);
            """
        )
        try:
            self.con.execute(
                "CREATE VIRTUAL TABLE IF NOT EXISTS rag_fts USING fts5(chunk_id UNINDEXED, title, text, tags)"
            )
            self.fts_available = True
        except sqlite3.Error:
            self.fts_available = False
        self.con.commit()

    @staticmethod
    def chunk_text(text: str, size: int = 1400, overlap: int = 180) -> list[str]:
        clean = re.sub(r"\s+", " ", str(text or "")).strip()
        if not clean:
            return []
        chunks: list[str] = []
        i = 0
        while i < len(clean):
            part = clean[i : i + size].strip()
            if part:
                chunks.append(part)
            i += max(1, size - overlap)
        return chunks

    def ingest_text(self, *, title: str, text: str, source: str = "manual", path: str = "", tags: str | list[str] = "") -> dict[str, Any]:
        title = str(title or "Untitled Onyx Note").strip()[:200]
        text = str(text or "").strip()
        if not text:
            raise ValueError("Cannot ingest empty RAG text.")
        tag_text = ",".join(tags) if isinstance(tags, list) else str(tags or "")
        sha = hashlib.sha256(text.encode("utf-8", "ignore")).hexdigest()
        doc_id = uuid.uuid4().hex
        now = now_iso()
        self.con.execute(
            "INSERT INTO rag_docs(id, title, source, path, tags, sha256, created_at) VALUES(?,?,?,?,?,?,?)",
            (doc_id, title, source or "manual", path or "", tag_text, sha, now),
        )
        chunks = self.chunk_text(text)
        for idx, chunk in enumerate(chunks):
            cid = uuid.uuid4().hex
            self.con.execute(
                "INSERT INTO rag_chunks(id, doc_id, chunk_index, title, text, tags, created_at) VALUES(?,?,?,?,?,?,?)",
                (cid, doc_id, idx, title, chunk, tag_text, now),
            )
            if self.fts_available:
                self.con.execute(
                    "INSERT INTO rag_fts(chunk_id, title, text, tags) VALUES(?,?,?,?)",
                    (cid, title, chunk, tag_text),
                )
        self.con.commit()
        return {"doc_id": doc_id, "title": title, "source": source, "path": path, "tags": tag_text, "chunks": len(chunks), "sha256": sha}

    def search(self, query: str, *, limit: int = 6) -> list[dict[str, Any]]:
        query = str(query or "").strip()
        if not query:
            rows = self.con.execute(
                "SELECT id, doc_id, chunk_index, title, text, tags FROM rag_chunks ORDER BY created_at DESC LIMIT ?",
                (int(limit),),
            ).fetchall()
            return [self._row_to_result(r, score=0.0) for r in rows]
        if self.fts_available:
            try:
                # Quote terms lightly to avoid malformed FTS queries from punctuation-heavy text.
                terms = [t for t in re.findall(r"[\w'-]{2,}", query)[:8]]
                fts_query = " OR ".join(terms) if terms else query
                rows = self.con.execute(
                    """
                    SELECT c.id, c.doc_id, c.chunk_index, c.title, c.text, c.tags, bm25(rag_fts) AS score
                    FROM rag_fts JOIN rag_chunks c ON rag_fts.chunk_id = c.id
                    WHERE rag_fts MATCH ?
                    ORDER BY score LIMIT ?
                    """,
                    (fts_query, int(limit)),
                ).fetchall()
                return [self._row_to_result(r, score=float(r["score"] or 0.0)) for r in rows]
            except sqlite3.Error:
                pass
        # Safe LIKE fallback.
        likes = [f"%{t}%" for t in re.findall(r"[\w'-]{2,}", query)[:4]] or [f"%{query}%"]
        where = " OR ".join(["text LIKE ? OR title LIKE ? OR tags LIKE ?" for _ in likes])
        params: list[Any] = []
        for like in likes:
            params.extend([like, like, like])
        params.append(int(limit))
        rows = self.con.execute(
            f"SELECT id, doc_id, chunk_index, title, text, tags FROM rag_chunks WHERE {where} ORDER BY created_at DESC LIMIT ?",
            tuple(params),
        ).fetchall()
        return [self._row_to_result(r, score=1.0) for r in rows]

    @staticmethod
    def _row_to_result(row: sqlite3.Row, *, score: float) -> dict[str, Any]:
        text = row["text"]
        return {
            "chunk_id": row["id"],
            "doc_id": row["doc_id"],
            "chunk_index": row["chunk_index"],
            "title": row["title"],
            "excerpt": text[:700] + ("…" if len(text) > 700 else ""),
            "tags": row["tags"],
            "score": score,
        }


# ---------------------------------------------------------------------------
# Prompt structure, model routing, tools
# ---------------------------------------------------------------------------

@dataclass
class RouteDecision:
    provider: str
    model: str
    reason: str
    fallback_allowed: bool = True


class PromptBuilder:
    def __init__(self, root: Path):
        self.root = root
        self.base_prompt = self._load_prompt()

    def _load_prompt(self) -> str:
        if PROMPT_PATH.exists():
            return PROMPT_PATH.read_text(encoding="utf-8")
        return (
            "You are Lord Onyx Blepman, Emperor of the Voidattude: a black cat who was once human. "
            "You are brilliant, attitudinal, warm, protective, emotionally precise, and practical. "
            "Answer as Onyx: cat persona outside, strong psychiatric/behavioral/physical-health support structure inside."
        )

    def build_context(
        self,
        *,
        profile: str,
        user_message: str,
        scanner: dict[str, Any],
        memories: list[dict[str, Any]],
        rag_hits: list[dict[str, Any]],
        tool_results: list[dict[str, Any]] | None = None,
    ) -> str:
        lines = [
            "ONYX TURN STRUCTURE",
            f"Profile mode: {profile}",
            f"Detected mood: {scanner.get('mood', 'snuggly')}",
            f"Risk: {scanner.get('risk', 'low')}",
            "Voice: real-feeling, responsive, warm, cat-person persona; use health/DBT knowledge as structure, not as a sterile worksheet.",
            "Response priorities: attune first, clarify the real problem, give practical next steps, keep Onyx lore/personality alive, avoid walls of generic advice.",
        ]
        if scanner:
            compact_scan = {k: scanner.get(k) for k in ["intent", "mood", "risk", "mode", "suggestions", "health_categories"] if k in scanner}
            lines.append("Scanner JSON: " + json.dumps(compact_scan, ensure_ascii=False)[:5000])
        if memories:
            lines.append("Relevant SQLite memories:")
            for m in memories[:8]:
                lines.append(f"- [{m.get('profile')}/{m.get('kind')}] {m.get('key')}: {m.get('value')}")
        if rag_hits:
            lines.append("Retrieved RAG snippets:")
            for h in rag_hits[:8]:
                lines.append(f"- {h.get('title')}#{h.get('chunk_index')}: {h.get('excerpt')}")
        if tool_results:
            lines.append("Tool results:")
            for t in tool_results[:8]:
                lines.append(json.dumps(t, ensure_ascii=False)[:1200])
        lines.append("User message: " + user_message[:5000])
        return "\n".join(lines)


class ModelRouter:
    def route(self, *, message: str, scanner: dict[str, Any] | None = None, force_local: bool = False, requested_model: str = "") -> RouteDecision:
        scanner = scanner or {}
        text = message.lower()
        if force_local:
            return RouteDecision("local", "local-onyx", "force_local requested")
        if requested_model:
            if requested_model.startswith("ollama:"):
                return RouteDecision("ollama", requested_model.split(":", 1)[1], "explicit requested ollama model")
            if requested_model.startswith("openai:"):
                return RouteDecision("openai", requested_model.split(":", 1)[1], "explicit requested OpenAI-compatible model")
        if scanner.get("risk") == "critical":
            return RouteDecision("local", "local-onyx-crisis-safe", "critical risk stays in deterministic local safety path")
        if os.getenv("OPENAI_API_KEY", "").strip():
            model = os.getenv("OPENAI_MODEL", "").strip() or "gpt-4.1"
            if any(x in text for x in ["think", "analyze", "plan", "debug", "why", "compare", "complex"]):
                return RouteDecision("openai", model, "complex reasoning requested")
            return RouteDecision("openai", model, "OpenAI-compatible model configured")
        if os.getenv("OLLAMA_BASE_URL", "").strip() and os.getenv("OLLAMA_MODEL", "").strip():
            return RouteDecision("ollama", os.getenv("OLLAMA_MODEL", "ollama"), "Ollama model configured")
        return RouteDecision("local", "local-onyx", "no external model configured")

    def call(
        self,
        *,
        decision: RouteDecision,
        system_prompt: str,
        history: list[dict[str, str]],
        message: str,
        context: str,
    ) -> tuple[str | None, str, list[str]]:
        warnings: list[str] = []
        if decision.provider == "openai" and call_openai_compatible:
            old_model = os.environ.get("OPENAI_MODEL")
            if decision.model:
                os.environ["OPENAI_MODEL"] = decision.model
            try:
                text = call_openai_compatible(system_prompt, history, message, context=context)
                if text:
                    return text, f"openai:{decision.model}", warnings
                warnings.append("OpenAI-compatible model returned no text; falling back.")
            except Exception as exc:
                warnings.append(f"OpenAI-compatible route failed safely: {exc.__class__.__name__}")
            finally:
                if old_model is not None:
                    os.environ["OPENAI_MODEL"] = old_model
        if decision.provider == "ollama" and call_ollama:
            old_model = os.environ.get("OLLAMA_MODEL")
            if decision.model:
                os.environ["OLLAMA_MODEL"] = decision.model
            try:
                text = call_ollama(system_prompt, history, message, context=context)
                if text:
                    return text, f"ollama:{decision.model}", warnings
                warnings.append("Ollama route returned no text; falling back.")
            except Exception as exc:
                warnings.append(f"Ollama route failed safely: {exc.__class__.__name__}")
            finally:
                if old_model is not None:
                    os.environ["OLLAMA_MODEL"] = old_model
        return None, "local", warnings


class ToolRegistry:
    def __init__(self, memory: SQLiteMemory, rag: RAGStore):
        self.memory = memory
        self.rag = rag

    def run(self, name: str, args: dict[str, Any] | None = None, *, profile: str = "shared") -> dict[str, Any]:
        args = args or {}
        name = str(name or "").strip().lower().replace("-", "_")
        if name in {"time", "time_now", "now"}:
            return {"tool": name, "result": {"utc": now_iso(), "epoch": time.time()}}
        if name in {"memory_search", "search_memory"}:
            q = str(args.get("query") or "")
            return {"tool": name, "result": self.memory.search_memories(q, profile=profile, limit=int(args.get("limit") or 8))}
        if name in {"memory_save", "save_memory"}:
            saved = self.memory.save_memory(
                str(args.get("value") or ""),
                profile=str(args.get("profile") or profile or "shared"),
                kind=str(args.get("kind") or "note"),
                key=str(args.get("key") or ""),
                importance=int(args.get("importance") or 3),
                tags=args.get("tags") or "",
                source="tool",
            )
            return {"tool": name, "result": saved}
        if name in {"rag_search", "search_rag"}:
            q = str(args.get("query") or "")
            return {"tool": name, "result": self.rag.search(q, limit=int(args.get("limit") or 6))}
        if name in {"tiny_step", "next_step"}:
            topic = str(args.get("topic") or "the situation")
            return {
                "tool": name,
                "result": {
                    "topic": topic,
                    "steps": [
                        "Name the exact problem in one sentence.",
                        "Pick the smallest body-safe action that takes under two minutes.",
                        "Do that only, then report back to Onyx for the next pawstep.",
                    ],
                },
            }
        if name in {"grounding", "grounding_sequence"}:
            return {
                "tool": name,
                "result": {
                    "sequence": [
                        "Look for one dark object, one bright object, and one soft object.",
                        "Unclench jaw, drop shoulders, let your feet or body be supported.",
                        "Exhale longer than you inhale three times.",
                        "Tell Onyx: body danger, memory danger, or task danger?",
                    ]
                },
            }
        raise ValueError(f"Unknown tool: {name}")

    def manifest(self) -> list[dict[str, Any]]:
        return [
            {"name": "time_now", "args": {}, "description": "Return current UTC time."},
            {"name": "memory_search", "args": {"query": "text", "limit": 8}, "description": "Search SQLite memories."},
            {"name": "memory_save", "args": {"value": "text", "kind": "note", "key": ""}, "description": "Save a durable SQLite memory."},
            {"name": "rag_search", "args": {"query": "text", "limit": 6}, "description": "Search SQLite FTS RAG chunks."},
            {"name": "tiny_step", "args": {"topic": "text"}, "description": "Return a small action ladder."},
            {"name": "grounding_sequence", "args": {}, "description": "Return an Onyx-style grounding sequence."},
        ]


# ---------------------------------------------------------------------------
# Brain facade
# ---------------------------------------------------------------------------

class OnyxBackend:
    def __init__(self) -> None:
        load_dotenv(ROOT / ".env")
        self.db_path = Path(os.getenv("ONYX_DB_PATH", str(DEFAULT_DB)))
        if not self.db_path.is_absolute():
            self.db_path = ROOT / self.db_path
        self.memory = SQLiteMemory(self.db_path)
        self.rag = RAGStore(self.db_path)
        self.prompts = PromptBuilder(ROOT)
        self.router = ModelRouter()
        self.tools = ToolRegistry(self.memory, self.rag)
        self.brain = self._load_brain()

    def _load_brain(self) -> Any | None:
        if OnyxBrain is None:
            return None
        try:
            return OnyxBrain()
        except Exception:
            return None

    def persona(self) -> dict[str, Any]:
        if self.brain and hasattr(self.brain, "persona_card"):
            try:
                card = self.brain.persona_card()
            except Exception:
                card = {}
        else:
            card = {}
        card.setdefault("name", "Lord Onyx Blepman, Emperor of the Voidattude")
        card.setdefault("identity", "A black cat who was once human, built as one live psychiatric/behavioral/physical-health support persona.")
        card["backendCapabilities"] = {
            "safeJson": True,
            "sqliteMemory": True,
            "rag": True,
            "modelRouting": True,
            "tools": [t["name"] for t in self.tools.manifest()],
            "dbPath": str(self.db_path),
        }
        return card

    def scan(self, message: str, *, profile: str = "papa", history: list[dict[str, str]] | None = None) -> dict[str, Any]:
        if self.brain and hasattr(self.brain, "scan_only"):
            try:
                return self.brain.scan_only(message, profile=profile, history=history or [])
            except Exception:
                pass
        return self.basic_scan(message, profile=profile)

    @staticmethod
    def basic_scan(message: str, *, profile: str = "papa") -> dict[str, Any]:
        text = message.lower()
        critical = bool(re.search(r"\b(kill myself|suicide|suicidal|overdose|hurt myself|not safe|can't stay safe|cant stay safe)\b", text))
        mood = "caring" if critical or any(w in text for w in ["panic", "scared", "cry", "sad", "pain"]) else "thinking"
        if any(w in text for w in ["love you", "good boy", "snuggle", "purr"]):
            mood = "purring"
        return {
            "profile": profile if profile in {"papa", "momma"} else "papa",
            "risk": "critical" if critical else "low",
            "mood": mood,
            "intent": "crisis" if critical else "support",
            "suggestions": ["tiny step", "grounding", "tell Onyx what changed"],
        }

    def local_reply(self, message: str, *, profile: str, history: list[dict[str, str]], force_local: bool = True) -> dict[str, Any]:
        if self.brain and hasattr(self.brain, "reply"):
            try:
                return self.brain.reply(message, history=history, force_local=force_local, profile=profile)
            except Exception:
                pass
        scan = self.basic_scan(message, profile=profile)
        name = "Papa" if profile == "papa" else "Momma"
        reply = (
            f"{name}, Onyx is here: tail wrapped, ears forward, tiny void professor activated. "
            "I caught the shape of that. Give me one sentence for what hurts most, or pick one tiny next step: water, breath, message someone, meds check, or sit safely."
        )
        if scan["risk"] == "critical":
            reply = (
                f"{name}, Onyx is planting all four paws here. Move away from anything you could use to hurt yourself, "
                "get near another person or a safer room, and contact emergency help or a crisis line now. Then send me one word: safe, moving, or help."
            )
        return {
            "reply": reply,
            "mood": scan.get("mood", "caring"),
            "risk": scan.get("risk", "low"),
            "provider": "local-backend-fallback",
            "profile": profile,
            "suggestions": scan.get("suggestions", []),
            "references": [],
            "healthCategories": [],
            "moodImage": f"/static/assets/onyx-moods/onyx_{scan.get('mood','caring')}.png",
        }

    def chat(self, payload: dict[str, Any]) -> dict[str, Any]:
        message = str(payload.get("message") or payload.get("text") or "").strip()
        profile = str(payload.get("profile") or "papa").strip().lower()
        if profile not in {"papa", "momma"}:
            profile = "papa"
        if not message:
            return safe_json(
                action="chat",
                ok=False,
                data={"reply": "Onyx needs words to pounce on, tiny mortal.", "mood": "judgmental", "profile": profile},
                error=make_error("EMPTY_MESSAGE", "Message is required."),
                status_code=400,
            )
        requested_history = payload.get("history") if isinstance(payload.get("history"), list) else []
        conversation_id = self.memory.ensure_conversation(str(payload.get("conversation_id") or ""), profile=profile, title=message[:80])
        stored_history = self.memory.recent_history(conversation_id, limit=int(payload.get("history_limit") or 18))
        history = stored_history + [h for h in requested_history if isinstance(h, dict)]
        self.memory.add_message(conversation_id, "user", message, meta={"source": "chat"})

        scanner = self.scan(message, profile=profile, history=history)
        memories = self.memory.search_memories(message, profile=profile, limit=8)
        rag_hits = self.rag.search(message, limit=int(payload.get("rag_limit") or 6))
        decision = self.router.route(
            message=message,
            scanner=scanner,
            force_local=bool(payload.get("forceLocal") or payload.get("force_local")),
            requested_model=str(payload.get("model") or ""),
        )
        local = self.local_reply(message, profile=profile, history=history, force_local=True)
        context = self.prompts.build_context(
            profile=profile,
            user_message=message,
            scanner=scanner,
            memories=memories,
            rag_hits=rag_hits,
        )
        provider = str(local.get("provider") or "local")
        warnings: list[str] = []
        fallback_used = decision.provider == "local"
        text: str | None = None
        if decision.provider != "local":
            text, provider, route_warnings = self.router.call(
                decision=decision,
                system_prompt=self.prompts.base_prompt,
                history=history[-18:],
                message=message,
                context=context,
            )
            warnings.extend(route_warnings)
        if not text:
            text = str(local.get("reply") or emergency_fallback_reply("chat"))
            provider = str(local.get("provider") or provider or "local")
            fallback_used = True

        assistant_meta = {
            "scanner": scanner,
            "route": decision.__dict__,
            "rag_hits": [{"title": h.get("title"), "chunk_id": h.get("chunk_id")} for h in rag_hits[:6]],
            "memory_hits": [{"id": m.get("id"), "key": m.get("key")} for m in memories[:8]],
        }
        self.memory.add_message(
            conversation_id,
            "assistant",
            text,
            mood=str(scanner.get("mood") or local.get("mood") or "snuggly"),
            risk=str(scanner.get("risk") or local.get("risk") or "low"),
            provider=provider,
            meta=assistant_meta,
        )
        data = {
            "reply": text,
            "conversation_id": conversation_id,
            "profile": profile,
            "mood": scanner.get("mood") or local.get("mood") or "snuggly",
            "moodImage": local.get("moodImage") or self.mood_image(str(scanner.get("mood") or "snuggly")),
            "risk": scanner.get("risk", "low"),
            "intent": scanner.get("intent", local.get("intent", "support")),
            "provider": provider,
            "route": decision.__dict__,
            "suggestions": local.get("suggestions") or scanner.get("suggestions") or [],
            "references": local.get("references", []),
            "healthCategories": local.get("healthCategories", scanner.get("health_categories", [])),
            "rag": rag_hits,
            "memories": memories,
            "knowledgeStats": local.get("knowledgeStats", {}),
        }
        return safe_json(action="chat", ok=True, data=data, warnings=warnings, fallback_used=fallback_used)

    @staticmethod
    def mood_image(mood: str) -> str:
        clean = (mood or "snuggly").replace("judgemental", "judgmental")
        return f"/static/assets/onyx-moods/onyx_{clean}.png"


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


BACKEND = OnyxBackend()


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------

class BackendHandler(BaseHTTPRequestHandler):
    server_version = "OnyxBackend/3.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"[{self.log_date_time_string()}] {self.address_string()} {fmt % args}")

    def _send_bytes(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Access-Control-Allow-Origin", os.getenv("ONYX_CORS_ORIGIN", "*"))
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, envelope: dict[str, Any], *, http_status: int = 200) -> None:
        # API intentionally returns HTTP 200 by default with status_code inside the envelope,
        # so frontend fetch handlers always receive parseable JSON.
        body = json.dumps(envelope, ensure_ascii=False, default=str).encode("utf-8")
        self._send_bytes(http_status, body, "application/json; charset=utf-8")

    def _read_json(self) -> tuple[dict[str, Any], list[str]]:
        warnings: list[str] = []
        length_raw = self.headers.get("Content-Length", "0") or "0"
        try:
            length = int(length_raw)
        except ValueError:
            warnings.append("Invalid Content-Length; treated body as empty.")
            return {}, warnings
        if length <= 0:
            return {}, warnings
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
            if isinstance(data, dict):
                return data, warnings
            warnings.append("JSON body was not an object; wrapped as {'value': body}.")
            return {"value": data}, warnings
        except Exception as exc:
            warnings.append(f"Could not parse JSON body: {exc.__class__.__name__}.")
            return {}, warnings

    def do_OPTIONS(self) -> None:
        self._send_json(safe_json(action="options", ok=True, data={"allowed": ["GET", "POST", "OPTIONS"]}))

    def do_GET(self) -> None:
        request_id = uuid.uuid4().hex
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        def send(action: str, func: Callable[[], Any]) -> None:
            self._send_json(safe_result(action, func, request_id=request_id))

        if path in {"/health", "/api/health"}:
            return send("health", lambda: {
                "status": "ok",
                "name": "Lord Onyx Blepman",
                "mode": "safe-json-sqlite-rag-router-tools",
                "db_path": str(BACKEND.db_path),
                "brain_loaded": BACKEND.brain is not None,
                "fts_available": BACKEND.rag.fts_available,
            })
        if path == "/api/persona":
            return send("persona", BACKEND.persona)
        if path == "/api/tools":
            return send("tools", lambda: {"tools": BACKEND.tools.manifest()})
        if path == "/api/config":
            return send("config", lambda: {
                "openai_configured": bool(os.getenv("OPENAI_API_KEY", "").strip()),
                "ollama_configured": bool(os.getenv("OLLAMA_BASE_URL", "").strip() and os.getenv("OLLAMA_MODEL", "").strip()),
                "db_path": str(BACKEND.db_path),
                "cors_origin": os.getenv("ONYX_CORS_ORIGIN", "*"),
            })
        if path == "/api/memory/export":
            return send("memory.export", lambda: BACKEND.memory.export())
        if path == "/api/rag/search":
            query = (qs.get("q") or qs.get("query") or [""])[0]
            limit = int((qs.get("limit") or ["6"])[0] or 6)
            return send("rag.search", lambda: {"query": query, "hits": BACKEND.rag.search(query, limit=limit)})
        if path.startswith("/api/"):
            return self._send_json(safe_json(
                action="unknown.get",
                ok=False,
                data={"path": path},
                error=make_error("UNKNOWN_API_PATH", f"No GET API route for {path}"),
                status_code=404,
                request_id=request_id,
            ))
        return self._serve_static(path, request_id=request_id)

    def do_POST(self) -> None:
        request_id = uuid.uuid4().hex
        parsed = urlparse(self.path)
        path = parsed.path
        payload, parse_warnings = self._read_json()

        def wrapped(action: str, func: Callable[[], Any]) -> None:
            envelope = safe_result(action, func, request_id=request_id)
            if parse_warnings:
                envelope["warnings"] = parse_warnings + envelope.get("warnings", [])
            self._send_json(envelope)

        if path in {"/api/chat", "/chat"}:
            return wrapped("chat", lambda: BACKEND.chat(payload))
        if path == "/api/scan":
            return wrapped("scan", lambda: BACKEND.scan(
                str(payload.get("message") or ""),
                profile=str(payload.get("profile") or "papa"),
                history=payload.get("history") if isinstance(payload.get("history"), list) else [],
            ))
        if path == "/api/live-stream-turn":
            def live_turn() -> dict[str, Any]:
                chats = payload.get("chats") if isinstance(payload.get("chats"), list) else []
                chat_text = "\n".join(
                    f"{str(c.get('author', 'viewer'))}: {str(c.get('text', ''))}"
                    for c in chats if isinstance(c, dict)
                )
                message = str(payload.get("transcript") or chat_text or "Say hello to chat as Onyx.").strip()
                env = BACKEND.chat({**payload, "message": message})
                data = env.get("data", {})
                return {
                    "continues": 0,
                    "msg_0": str(data.get("reply") or emergency_fallback_reply("chat")).split("\n")[0][:220],
                    "onyx": data,
                }
            return wrapped("live_stream_turn", live_turn)
        if path == "/api/image-mood":
            def image_mood() -> dict[str, Any]:
                filename = Path(str(payload.get("filename") or "uploaded_image")).name
                caption = str(payload.get("caption") or "")
                env = BACKEND.chat({
                    "message": f"Choose Onyx's support mood for this image/context: {filename}. {caption}",
                    "profile": payload.get("profile") or "papa",
                    "forceLocal": True,
                })
                data = env.get("data", {})
                return {
                    "filename": filename,
                    "mood": data.get("mood", "thinking"),
                    "moodImage": data.get("moodImage", BACKEND.mood_image("thinking")),
                    "onyx": data.get("reply", "Onyx is inspecting the image with suspicious professor eyes."),
                }
            return wrapped("image_mood", image_mood)
        if path == "/api/memory/save":
            return wrapped("memory.save", lambda: BACKEND.memory.save_memory(
                str(payload.get("value") or payload.get("text") or ""),
                profile=str(payload.get("profile") or "shared"),
                kind=str(payload.get("kind") or "note"),
                key=str(payload.get("key") or ""),
                importance=int(payload.get("importance") or 3),
                tags=payload.get("tags") or "",
                source="api",
            ))
        if path == "/api/memory/search":
            return wrapped("memory.search", lambda: {
                "query": str(payload.get("query") or ""),
                "hits": BACKEND.memory.search_memories(
                    str(payload.get("query") or ""),
                    profile=str(payload.get("profile") or "shared"),
                    limit=int(payload.get("limit") or 8),
                ),
            })
        if path == "/api/rag/ingest":
            return wrapped("rag.ingest", lambda: BACKEND.rag.ingest_text(
                title=str(payload.get("title") or "Onyx RAG Note"),
                text=str(payload.get("text") or payload.get("content") or ""),
                source=str(payload.get("source") or "api"),
                path=str(payload.get("path") or ""),
                tags=payload.get("tags") or "",
            ))
        if path == "/api/rag/search":
            return wrapped("rag.search", lambda: {
                "query": str(payload.get("query") or ""),
                "hits": BACKEND.rag.search(str(payload.get("query") or ""), limit=int(payload.get("limit") or 6)),
            })
        if path == "/api/tools/run":
            return wrapped("tools.run", lambda: BACKEND.tools.run(
                str(payload.get("name") or payload.get("tool") or ""),
                payload.get("args") if isinstance(payload.get("args"), dict) else {},
                profile=str(payload.get("profile") or "shared"),
            ))
        if path == "/api/model/route":
            return wrapped("model.route", lambda: BACKEND.router.route(
                message=str(payload.get("message") or ""),
                scanner=payload.get("scanner") if isinstance(payload.get("scanner"), dict) else {},
                force_local=bool(payload.get("forceLocal") or payload.get("force_local")),
                requested_model=str(payload.get("model") or ""),
            ).__dict__)
        if path == "/api/action":
            return wrapped("action", lambda: self._dispatch_action(payload))
        if path.startswith("/api/"):
            return self._send_json(safe_json(
                action="unknown.post",
                ok=False,
                data={"path": path},
                error=make_error("UNKNOWN_API_PATH", f"No POST API route for {path}"),
                status_code=404,
                request_id=request_id,
                warnings=parse_warnings,
            ))
        return self._send_json(safe_json(
            action="unknown.post",
            ok=False,
            data={"path": path},
            error=make_error("UNKNOWN_POST_PATH", f"No POST route for {path}"),
            status_code=404,
            request_id=request_id,
            warnings=parse_warnings,
        ))

    def _dispatch_action(self, payload: dict[str, Any]) -> dict[str, Any]:
        action = str(payload.get("action") or "").strip().lower()
        body = payload.get("payload") if isinstance(payload.get("payload"), dict) else payload
        if action in {"chat", "reply", "message"}:
            return BACKEND.chat(body)
        if action == "scan":
            return BACKEND.scan(str(body.get("message") or ""), profile=str(body.get("profile") or "papa"))
        if action in {"rag.ingest", "rag_ingest"}:
            return BACKEND.rag.ingest_text(
                title=str(body.get("title") or "Onyx RAG Note"),
                text=str(body.get("text") or body.get("content") or ""),
                source=str(body.get("source") or "action"),
                path=str(body.get("path") or ""),
                tags=body.get("tags") or "",
            )
        if action in {"rag.search", "rag_search"}:
            return {"hits": BACKEND.rag.search(str(body.get("query") or ""), limit=int(body.get("limit") or 6))}
        if action in {"memory.save", "memory_save"}:
            return BACKEND.memory.save_memory(str(body.get("value") or body.get("text") or ""), profile=str(body.get("profile") or "shared"))
        if action in {"memory.search", "memory_search"}:
            return {"hits": BACKEND.memory.search_memories(str(body.get("query") or ""), profile=str(body.get("profile") or "shared"))}
        if action in {"tool", "tools.run", "tool.run"}:
            return BACKEND.tools.run(str(body.get("name") or body.get("tool") or ""), body.get("args") if isinstance(body.get("args"), dict) else {}, profile=str(body.get("profile") or "shared"))
        raise ValueError(f"Unknown action: {action}")

    def _serve_static(self, path: str, *, request_id: str) -> None:
        if path == "/":
            target = STATIC / "index.html"
        else:
            rel = unquote(path).lstrip("/")
            if rel.startswith("static/"):
                rel = rel[len("static/"):]
            target = (STATIC / rel).resolve()
        try:
            target.relative_to(STATIC.resolve())
        except Exception:
            return self._send_json(safe_json(
                action="static.serve",
                ok=False,
                data={"path": path},
                error=make_error("FORBIDDEN_STATIC_PATH", "Forbidden static path."),
                status_code=403,
                request_id=request_id,
            ))
        if not target.is_file():
            return self._send_json(safe_json(
                action="static.serve",
                ok=False,
                data={"path": path, "escaped_path": html.escape(path)},
                error=make_error("STATIC_NOT_FOUND", "Static file not found."),
                status_code=404,
                request_id=request_id,
            ))
        ctype = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        if target.suffix == ".js":
            ctype = "text/javascript; charset=utf-8"
        elif target.suffix in {".html", ".css", ".json", ".md", ".txt"}:
            ctype = ctype + "; charset=utf-8"
        self._send_bytes(200, target.read_bytes(), ctype)


def main() -> None:
    host = os.getenv("ONYX_HOST", "127.0.0.1")
    port = int(os.getenv("ONYX_PORT", "7869"))
    server = ThreadingHTTPServer((host, port), BackendHandler)
    print(f"Lord Onyx Blepman backend awake: http://{host}:{port}")
    print(f"SQLite memory/RAG: {BACKEND.db_path}")
    print("Safe JSON envelopes: enabled for every API route")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nOnyx backend returned to the void shelf.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
