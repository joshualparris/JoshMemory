// Repo Town multiplayer v1. Cloudflare Worker + two SQLite-backed Durable Objects.
// Public static game remains separate; only signed-in player presence is transmitted.
// Deploy with metadata in deploy/multiplayer-worker-metadata.json. No secrets in source.
const ORIGINS = new Set([
  'https://repository-town-claude-complete.vercel.app',
  'https://repository-town-claude-playtest.vercel.app',
  'https://parris-tech-services.github.io',
  'https://joshualparris.github.io',
  'https://repository-town-main-qa.onrender.com',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8091',
  'http://127.0.0.1:8091'
]);
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
const randomHex = n => hex(crypto.getRandomValues(new Uint8Array(n)));
const hash = async input => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))));
const safeUsername = value => typeof value === 'string' && /^[a-zA-Z0-9_]{3,24}$/.test(value);
const safePassword = value => typeof value === 'string' && value.length >= 12 && value.length <= 128;
const parse = async request => {
  const body = await request.text();
  if (body.length > 1000) throw new Error('Request too large');
  return JSON.parse(body);
};
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({
    name: 'PBKDF2', hash: 'SHA-256', salt: Uint8Array.from(salt.match(/../g), x => parseInt(x, 16)),
    iterations: 100000
  }, key, 256);
  return hex(new Uint8Array(derived));
}
function equalHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export class Accounts {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at INTEGER NOT NULL)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, expires_at INTEGER NOT NULL)');
    // Persistent rather than in-memory limits; DOs can restart between requests.
    this.sql.exec('CREATE TABLE IF NOT EXISTS login_limits (ip_hash TEXT PRIMARY KEY, minute INTEGER NOT NULL, tries INTEGER NOT NULL)');
    this.rateChecks = 0;
  }
  async limit(request) {
    // Store hashes, never raw addresses. SQLite survives process eviction.
    const ip = request.headers.get('x-real-player-ip') || 'unknown';
    const key = await hash(ip);
    const minute = Math.floor(Date.now() / 60000);
    this.sql.exec('INSERT INTO login_limits (ip_hash, minute, tries) VALUES (?, ?, 1) ON CONFLICT(ip_hash) DO UPDATE SET minute = excluded.minute, tries = CASE WHEN minute = excluded.minute THEN tries + 1 ELSE 1 END', key, minute);
    const row = this.sql.exec('SELECT tries FROM login_limits WHERE ip_hash = ?', key).toArray()[0];
    if (++this.rateChecks % 100 === 0) this.sql.exec('DELETE FROM login_limits WHERE minute < ?', minute - 2);
    return row.tries <= 12;
  }
  async verify(request) {
    const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return reply({error:'Not signed in'}, 401);
    const tokenHash = await hash(token);
    const row = this.sql.exec('SELECT a.id, a.username, s.expires_at FROM sessions s JOIN accounts a ON a.id = s.account_id WHERE s.hash = ? LIMIT 1', tokenHash).toArray()[0];
    if (!row || row.expires_at < Date.now()) return reply({error:'Session expired'}, 401);
    return reply({id:row.id, username:row.username, expiresAt:row.expires_at});
  }
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === '/verify') return this.verify(request);
    if (path === '/ping') { this.sql.exec('SELECT 1'); return reply({ok:true}); }
    // Internal namespace-only endpoint: World periodically checks sessions and
    // immediately stops accepting broadcasts from signed-out or expired users.
    if (path === '/active') {
      const key = request.headers.get('x-session-hash');
      if (!/^[a-f0-9]{64}$/.test(key || '')) return reply({active:false}, 401);
      const row = this.sql.exec('SELECT expires_at FROM sessions WHERE hash = ? LIMIT 1', key).toArray()[0];
      return row && row.expires_at > Date.now() ? reply({active:true}) : reply({active:false}, 401);
    }
    if (path === '/logout') {
      const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
      if (token && /^[a-f0-9]{64}$/.test(token)) {
        this.sql.exec('DELETE FROM sessions WHERE hash = ?', await hash(token));
      }
      return reply({ok:true});
    }
    if (path !== '/register' && path !== '/login') return reply({error:'Not found'}, 404);
    if (!await this.limit(request)) return reply({error:'Too many attempts. Try again in a minute.'}, 429);
    let fields;
    try { fields = await parse(request); } catch { return reply({error:'Invalid request'}, 400); }
    const username = String(fields.username || '').trim().toLowerCase();
    const password = fields.password;
    if (!safeUsername(username) || !safePassword(password)) {
      return reply({error:'Use a 3–24 character username (letters, numbers, underscore) and password of at least 12 characters.'}, 400);
    }
    let account;
    if (path === '/register') {
      if (this.sql.exec('SELECT id FROM accounts WHERE username = ?', username).toArray().length) return reply({error:'Username already taken'}, 409);
      const id = crypto.randomUUID(), salt = randomHex(16);
      const derived = await passwordHash(password, salt);
      try {
        this.sql.exec('INSERT INTO accounts (id, username, salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
          id, username, salt, derived, Date.now());
      } catch { return reply({error:'Username already taken'}, 409); }
      account = {id, username};
    } else {
      const row = this.sql.exec('SELECT id, username, salt, password_hash FROM accounts WHERE username = ? LIMIT 1', username).toArray()[0];
      // Always perform a derivation, including for unknown users.
      const attempted = await passwordHash(password, row?.salt || '0'.repeat(32));
      if (!row || !equalHex(attempted, row.password_hash)) return reply({error:'Incorrect username or password'}, 401);
      account = {id:row.id, username:row.username};
    }
    const token = randomHex(32);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.sql.exec('INSERT INTO sessions (hash, account_id, expires_at) VALUES (?, ?, ?)',
      await hash(token), account.id, expiresAt);
    // Cleanup is bounded; sessions remain revoked on logout and expire after a week.
    this.sql.exec('DELETE FROM sessions WHERE expires_at < ?', Date.now());
    return reply({...account, token, expiresAt});
  }
}

const validZone = value => typeof value === 'string' &&
  /^(town|house:[a-zA-Z0-9:_-]{1,70})$/.test(value);
const finite = (n, limit) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= limit;
const send = (ws, data) => { try { ws.send(JSON.stringify(data)); } catch {} };

export class World {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  // CLOSE_PENDING sockets are excluded from capacity and peer broadcasts.
  sockets() { return this.ctx.getWebSockets().filter(s => s.readyState === WebSocket.OPEN); }
  connections() { return this.sockets().filter(s => s.deserializeAttachment()?.ready); }
  profile(m) {
    return {id:m.id, name:m.name, zone:m.zone, x:m.x, y:m.y, z:m.z, yaw:m.yaw};
  }
  nearby(a, b) {
    return a.ready && b.ready && a.zone === b.zone &&
      Math.hypot(a.x - b.x, a.z - b.z) <= 115; // Client renders within 90 m.
  }
  async scheduleSweep() {
    if ((await this.ctx.storage.getAlarm()) === null)
      await this.ctx.storage.setAlarm(Date.now() + 30000);
  }
  remove(ws) {
    const m = ws.deserializeAttachment();
    if (!m?.ready) return;
    // Removal is idempotent, including on concurrent error+close callbacks.
    ws.serializeAttachment({...m, ready:false, visible:[]});
    for (const other of this.connections()) {
      if (other === ws) continue;
      const p = other.deserializeAttachment();
      if (!(p.visible || []).includes(m.id)) continue;
      send(other, {type:'leave', id:m.id});
      other.serializeAttachment({...p, visible:p.visible.filter(id => id !== m.id)});
    }
  }
  close(ws, code, reason) {
    this.remove(ws);
    try { ws.close(code, reason); } catch {}
  }
  async alarm() {
    const now = Date.now();
    for (const socket of this.sockets()) {
      const m = socket.deserializeAttachment() || {};
      const limit = m.ready ? 75000 : 15000;
      if (now - (m.lastSeen || m.connectedAt || 0) > limit) this.close(socket, 1001, 'Inactive connection');
    }
    if (this.sockets().length) await this.ctx.storage.setAlarm(Date.now() + 30000);
  }
  async fetch(request) {
    const path = new URL(request.url).pathname;
    // These paths are accessible only through the Worker namespace binding,
    // not through the public URL dispatcher.
    if (path === '/stats') return reply({online:this.connections().length, capacity:80, protocol:2});
    if (path === '/revoke') {
      const sessionHash = request.headers.get('x-session-hash');
      if (!/^[a-f0-9]{64}$/.test(sessionHash || '')) return reply({error:'Invalid session'}, 400);
      let closed = 0;
      for (const socket of this.connections()) {
        if (socket.deserializeAttachment()?.sessionHash === sessionHash) {
          send(socket, {type:'session-revoked'});
          this.close(socket, 1008, 'Session revoked');
          closed++;
        }
      }
      return reply({ok:true, closed});
    }
    if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket')
      return reply({error:'WebSocket required'}, 426);
    if (this.sockets().length >= 80) return reply({error:'Town server is full'}, 503);
    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({connectedAt:Date.now(), lastSeen:Date.now(), ready:false});
    await this.scheduleSweep();
    return new Response(null, {status:101, webSocket:client});
  }
  async stillActive(meta) {
    const auth = this.env.ACCOUNTS.get(this.env.ACCOUNTS.idFromName('accounts-v1'));
    const response = await auth.fetch('https://accounts.internal/active', {
      headers:{'x-session-hash':meta.sessionHash}
    });
    return response.ok;
  }
  syncPeers(ws, meta, moved) {
    // Two-way interest sets remain in attachments across DO hibernation.
    const oldVisible = new Set(meta.visible || []);
    const newVisible = [];
    for (const other of this.connections()) {
      if (other === ws) continue;
      const peer = other.deserializeAttachment();
      const inRange = this.nearby(meta, peer);
      const peerVisible = new Set(peer.visible || []);
      if (inRange) {
        newVisible.push(peer.id);
        if (!oldVisible.has(peer.id)) send(ws, {type:'join', ...this.profile(peer)});
        if (!peerVisible.has(meta.id)) {
          peerVisible.add(meta.id);
          send(other, {type:'join', ...this.profile(meta)});
          other.serializeAttachment({...peer, visible:[...peerVisible]});
        } else if (moved) send(other, {type:'state', ...this.profile(meta)});
      } else {
        if (oldVisible.has(peer.id)) send(ws, {type:'leave', id:peer.id});
        if (peerVisible.delete(meta.id)) {
          send(other, {type:'leave', id:meta.id});
          other.serializeAttachment({...peer, visible:[...peerVisible]});
        }
      }
    }
    ws.serializeAttachment({...meta, visible:newVisible});
  }
  async webSocketMessage(ws, raw) {
    if (typeof raw !== 'string' || raw.length > 800) {
      this.close(ws, 1009, 'Message too large'); return;
    }
    let data;
    try { data = JSON.parse(raw); } catch { this.close(ws, 1003, 'Invalid message'); return; }
    let meta = ws.deserializeAttachment() || {};
    const now = Date.now();
    if (!meta.id) {
      if (data?.type !== 'hello' || typeof data.token !== 'string' ||
          !/^[a-f0-9]{64}$/.test(data.token)) {
        this.close(ws, 1008, 'Sign in first'); return;
      }
      const auth = this.env.ACCOUNTS.get(this.env.ACCOUNTS.idFromName('accounts-v1'));
      const check = await auth.fetch('https://accounts.internal/verify', {
        headers:{authorization:'Bearer '+data.token}
      });
      if (!check.ok) { this.close(ws, 1008, 'Session expired'); return; }
      const user = await check.json();
      meta = {
        id:crypto.randomUUID(), accountId:user.id, name:user.username,
        sessionHash:await hash(data.token), expiresAt:user.expiresAt,
        zone:'town', x:0, y:0, z:0, yaw:0,
        connectedAt:meta.connectedAt || now, lastSeen:now,
        lastAuth:now, last:0, ready:false, visible:[]
      };
      ws.serializeAttachment(meta);
      // No position is trusted until this client sends its first valid state.
      send(ws, {type:'welcome', id:meta.id, name:meta.name, players:[], protocol:2});
      return;
    }
    if (now > meta.expiresAt) {
      this.close(ws, 1008, 'Session expired'); return;
    }
    if (now - (meta.lastAuth || 0) >= 60000) {
      if (!await this.stillActive(meta)) {
        send(ws, {type:'session-revoked'});
        this.close(ws, 1008, 'Session revoked');
        return;
      }
      meta.lastAuth = now;
    }
    meta.lastSeen = now;
    if (data?.type === 'ping') {
      // Respond even while the game is paused; no fake movement is created.
      if (now - (meta.lastPing || 0) >= 1000) {
        meta.lastPing = now;
        send(ws, {type:'pong', at:now});
      }
      ws.serializeAttachment(meta);
      return;
    }
    if (data?.type !== 'state') { ws.serializeAttachment(meta); return; }
    const {zone,x,y,z,yaw} = data;
    if (!validZone(zone) || !finite(x,12000) || !finite(z,12000) ||
        !finite(y,500) || !finite(yaw,1000)) { ws.serializeAttachment(meta); return; }
    if (now - meta.last < 120) { ws.serializeAttachment(meta); return; }
    const moved = !meta.ready || zone !== meta.zone ||
      Math.hypot(x-meta.x,y-meta.y,z-meta.z) > .01 || Math.abs(yaw-meta.yaw) > .01;
    meta = {...meta,zone,x,y,z,yaw,last:now,ready:true};
    this.syncPeers(ws, meta, moved);
  }
  webSocketClose(ws) { this.remove(ws); }
  webSocketError(ws) { this.close(ws, 1011, 'WebSocket error'); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');
    const allowed = origin && ORIGINS.has(origin);
    if (origin && !allowed) return reply({error:'Origin not allowed'}, 403);
    const cors = allowed ? {
      'access-control-allow-origin':origin, 'access-control-allow-headers':'authorization, content-type',
      'access-control-allow-methods':'GET,POST,OPTIONS', 'vary':'Origin'
    } : {};
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors});
    if (url.pathname === '/health') return new Response(JSON.stringify({ok:true,service:'repo-town-multiplayer',protocol:2}),{headers:{...JSON_HEADERS,...cors}});
    if (url.pathname === '/ready') {
      try {
        const [a,w] = await Promise.all([
          env.ACCOUNTS.get(env.ACCOUNTS.idFromName('accounts-v1')).fetch('https://accounts.internal/ping'),
          env.WORLD.get(env.WORLD.idFromName('repo-town-shared-v1')).fetch('https://world.internal/stats')
        ]);
        if (!a.ok || !w.ok) return new Response(JSON.stringify({ok:false}),{status:503,headers:{...JSON_HEADERS,...cors}});
        return new Response(JSON.stringify({ok:true,service:'repo-town-multiplayer',...(await w.json())}),{headers:{...JSON_HEADERS,...cors}});
      } catch {
        return new Response(JSON.stringify({ok:false,service:'repo-town-multiplayer'}),{status:503,headers:{...JSON_HEADERS,...cors}});
      }
    }
    if (url.pathname === '/ws') {
      return env.WORLD.get(env.WORLD.idFromName('repo-town-shared-v1')).fetch(request);
    }
    if (!['/register','/login','/logout','/me'].includes(url.pathname)) return new Response(JSON.stringify({error:'Not found'}),{status:404,headers:{...JSON_HEADERS,...cors}});
    if ((url.pathname === '/register' || url.pathname === '/login' || url.pathname === '/logout') && request.method !== 'POST') {
      return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{...JSON_HEADERS,...cors}});
    }
    const internal = new Request('https://accounts.internal'+(url.pathname === '/me'?'/verify':url.pathname), {
      method:url.pathname === '/me'?'GET':request.method,
      headers:{
        'authorization':request.headers.get('authorization') || '',
        'x-real-player-ip':request.headers.get('CF-Connecting-IP') || 'unknown',
        'content-type':'application/json'
      },
      // Buffer the small JSON request before forwarding into the accounts Durable Object.
      body:request.method === 'POST'?await request.text():null
    });
    const response = await env.ACCOUNTS.get(env.ACCOUNTS.idFromName('accounts-v1')).fetch(internal);
    if (url.pathname === '/logout' && response.ok) {
      const token = request.headers.get('authorization')?.replace(/^Bearer /i,'');
      if (token && /^[a-f0-9]{64}$/.test(token)) {
        try {
          await env.WORLD.get(env.WORLD.idFromName('repo-town-shared-v1')).fetch(
            'https://world.internal/revoke', {headers:{'x-session-hash':await hash(token)}});
        } catch {
          // Authentication DB is already revoked. A brief World outage should
          // not turn a successful sign-out into a failure; next socket auth
          // recheck blocks the revoked token.
        }
      }
    }
    const headers = new Headers(response.headers);
    for (const [key,value] of Object.entries(cors)) headers.set(key,value);
    headers.set('cache-control','no-store');
    return new Response(response.body,{status:response.status,headers});
  }
};
