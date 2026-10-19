// better-sqlite3's synchronous API on top of sql.js (SQLite in WebAssembly), so a game's
// own server code can run inside its page (tools/pack_games.mjs → server). The database is
// kept in localStorage between visits.
const save = (db, key) => {
  try {
    const bytes = db.export();
    let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    if (s.length < 4e6) localStorage.setItem(key, btoa(s));
  } catch { /* storage full or blocked: the game still runs, it just won't remember */ }
};

export default class Database {
  constructor() {
    const SQL = globalThis.__townSQL;
    this.key = 'town-sqlite:' + (globalThis.__townGame || 'game');
    let saved = null;
    try { saved = localStorage.getItem(this.key); } catch { /* blocked */ }
    this.db = saved ? new SQL.Database(Uint8Array.from(atob(saved), (c) => c.charCodeAt(0))) : new SQL.Database();
    globalThis.__townSaveDb = () => save(this.db, this.key);
  }

  prepare(sql) {
    const db = this.db;
    const bind = (args) => {
      if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
        const o = {};
        for (const [k, v] of Object.entries(args[0])) for (const p of ['@', ':', '$']) o[p + k] = v === undefined ? null : typeof v === 'boolean' ? +v : v;
        return o;
      }
      return args.flat().map((v) => (v === undefined ? null : typeof v === 'boolean' ? +v : v));
    };
    const withStmt = (args, fn) => { const st = db.prepare(sql); try { st.bind(bind(args)); return fn(st); } finally { st.free(); } };
    return {
      get: (...a) => withStmt(a, (st) => (st.step() ? st.getAsObject() : undefined)),
      all: (...a) => withStmt(a, (st) => { const out = []; while (st.step()) out.push(st.getAsObject()); return out; }),
      run: (...a) => withStmt(a, (st) => {
        st.step();
        const id = db.exec('select last_insert_rowid()')[0]?.values[0][0];
        return { changes: db.getRowsModified(), lastInsertRowid: id };
      }),
      iterate: (...a) => withStmt(a, (st) => { const out = []; while (st.step()) out.push(st.getAsObject()); return out; })[Symbol.iterator](),
    };
  }

  exec(sql) { this.db.exec(sql); return this; }
  pragma() { return []; }
  transaction(fn) {
    return (...a) => { this.db.exec('BEGIN'); try { const r = fn(...a); this.db.exec('COMMIT'); return r; } catch (e) { this.db.exec('ROLLBACK'); throw e; } };
  }
  close() {}
}
