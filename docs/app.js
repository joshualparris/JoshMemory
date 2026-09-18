(function () {
  "use strict";

  const state = {
    index: [],
    filtered: [],
    activeThreadId: null,
    sessionCache: new Map(),
    projectFilter: "",
    sourceFilter: "",
    query: "",
  };

  const el = {
    sessionList: document.getElementById("session-list"),
    sessionCount: document.getElementById("session-count"),
    search: document.getElementById("search"),
    projectFilter: document.getElementById("project-filter"),
    sourceFilter: document.getElementById("source-filter"),
    topbarStats: document.getElementById("topbar-stats"),
    emptyState: document.getElementById("empty-state"),
    sessionView: document.getElementById("session-view"),
    loading: document.getElementById("loading"),
    svTitle: document.getElementById("sv-title"),
    svMeta: document.getElementById("sv-meta"),
    transcript: document.getElementById("transcript"),
    eventSearch: document.getElementById("event-search"),
    eventSearchCount: document.getElementById("event-search-count"),
  };

  function fmtDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function relativeDay(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays <= 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${Math.floor(diffMonths / 12)}y ago`;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function highlight(text, query) {
    const escaped = escapeHtml(text);
    if (!query) return escaped;
    try {
      const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
      return escaped.replace(re, (m) => `<mark>${m}</mark>`);
    } catch (e) {
      return escaped;
    }
  }

  async function loadIndex() {
    const res = await fetch("data/index.json");
    state.index = await res.json();

    const metaRes = await fetch("data/meta.json");
    const meta = await metaRes.json();
    el.topbarStats.textContent = `${meta.session_count} sessions · ${meta.event_count.toLocaleString()} messages`;

    for (const p of meta.projects) {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      el.projectFilter.appendChild(opt);
    }
    for (const s of meta.sources) {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      el.sourceFilter.appendChild(opt);
    }

    applyFilters();
  }

  function applyFilters() {
    const q = state.query.trim().toLowerCase();
    state.filtered = state.index.filter((s) => {
      if (state.projectFilter && s.project !== state.projectFilter) return false;
      if (state.sourceFilter && s.source !== state.sourceFilter) return false;
      if (!q) return true;
      return (
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.preview && s.preview.toLowerCase().includes(q)) ||
        (s.project && s.project.toLowerCase().includes(q))
      );
    });
    renderSessionList();
  }

  function renderSessionList() {
    el.sessionCount.textContent = `${state.filtered.length} session${state.filtered.length === 1 ? "" : "s"}`;
    el.sessionList.innerHTML = "";

    if (state.filtered.length === 0) {
      const li = document.createElement("li");
      li.className = "no-results";
      li.textContent = "No sessions match.";
      el.sessionList.appendChild(li);
      return;
    }

    const frag = document.createDocumentFragment();
    for (const s of state.filtered) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "session-item" + (s.thread_id === state.activeThreadId ? " active" : "");
      btn.setAttribute("role", "option");
      btn.dataset.threadId = s.thread_id;
      btn.innerHTML = `
        <div class="session-item-title">${escapeHtml(s.title)}</div>
        <div class="session-item-meta">
          <span class="tag">${escapeHtml(s.source || "?")}</span>
          <span class="session-item-project">${escapeHtml(s.project)}</span>
          <span style="margin-left:auto; flex-shrink:0;">${relativeDay(s.updated_at || s.created_at)}</span>
        </div>
      `;
      btn.addEventListener("click", () => selectSession(s.thread_id));
      li.appendChild(btn);
      frag.appendChild(li);
    }
    el.sessionList.appendChild(frag);
  }

  async function selectSession(threadId) {
    state.activeThreadId = threadId;
    renderSessionList();

    el.emptyState.hidden = true;
    el.sessionView.hidden = true;
    el.loading.hidden = false;
    el.eventSearch.value = "";

    let session = state.sessionCache.get(threadId);
    if (!session) {
      const res = await fetch(`data/sessions/${threadId}.json`);
      session = await res.json();
      state.sessionCache.set(threadId, session);
    }

    renderSession(session);
    el.loading.hidden = true;
    el.sessionView.hidden = false;

    if (history.replaceState) {
      history.replaceState(null, "", `#${threadId}`);
    }
  }

  function renderSession(session) {
    el.svTitle.textContent = session.title;
    const bits = [];
    if (session.project) bits.push(escapeHtml(session.project));
    if (session.source) bits.push(`<span class="tag">${escapeHtml(session.source)}</span>`);
    if (session.model) bits.push(escapeHtml(session.model));
    if (session.branch) bits.push(`branch <code>${escapeHtml(session.branch)}</code>`);
    const dateStr = [session.created_at ? `started ${fmtDate(session.created_at)}` : null,
      session.updated_at && session.updated_at !== session.created_at ? `updated ${fmtDate(session.updated_at)}` : null]
      .filter(Boolean).join(" · ");
    if (dateStr) bits.push(dateStr);
    bits.push(`${session.events.length} messages`);
    el.svMeta.innerHTML = bits.map((b) => `<span>${b}</span>`).join('<span class="dot">·</span>');

    el.transcript.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const ev of session.events) {
      const div = document.createElement("div");
      const role = ev.role === "user" ? "user" : ev.role === "assistant" ? "assistant" : "other";
      div.className = `bubble role-${role}`;
      div.dataset.text = ev.text.toLowerCase();
      const roleLabel = ev.role || ev.kind || "event";
      div.innerHTML = `
        <div class="bubble-role"><span>${escapeHtml(roleLabel)}</span>${ev.timestamp ? `<span class="bubble-time">${fmtDate(ev.timestamp)}</span>` : ""}</div>
        <div class="bubble-text">${escapeHtml(ev.text)}</div>
      `;
      frag.appendChild(div);
    }
    el.transcript.appendChild(frag);
  }

  function filterEventsInSession() {
    const q = el.eventSearch.value.trim().toLowerCase();
    const bubbles = el.transcript.querySelectorAll(".bubble");
    let matches = 0;
    bubbles.forEach((b) => {
      const text = b.dataset.text || "";
      const isMatch = !q || text.includes(q);
      b.classList.toggle("hidden-by-search", !isMatch);
      if (isMatch && q) {
        const textEl = b.querySelector(".bubble-text");
        textEl.innerHTML = highlight(textEl.textContent, q);
        matches++;
      } else if (!q) {
        const textEl = b.querySelector(".bubble-text");
        textEl.innerHTML = escapeHtml(textEl.textContent);
      }
    });
    el.eventSearchCount.textContent = q ? `${matches} match${matches === 1 ? "" : "es"}` : "";
  }

  function init() {
    el.search.addEventListener("input", (e) => {
      state.query = e.target.value;
      applyFilters();
    });
    el.projectFilter.addEventListener("change", (e) => {
      state.projectFilter = e.target.value;
      applyFilters();
    });
    el.sourceFilter.addEventListener("change", (e) => {
      state.sourceFilter = e.target.value;
      applyFilters();
    });
    el.eventSearch.addEventListener("input", filterEventsInSession);

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== el.search && document.activeElement !== el.eventSearch) {
        e.preventDefault();
        el.search.focus();
      }
      if (e.key === "Escape") {
        document.activeElement && document.activeElement.blur();
      }
    });

    loadIndex().then(() => {
      const hash = location.hash.replace("#", "");
      if (hash && state.index.some((s) => s.thread_id === hash)) {
        selectSession(hash);
      }
    });
  }

  init();
})();
