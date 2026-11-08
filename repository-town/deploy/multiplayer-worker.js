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
    iterations: 210000
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
    this.attempts = new Map();
  }
  limit(request) {
    const ip = request.headers.get('x-real-player-ip') || 'unknown';
    const now = Date.now();
    const previous = this.attempts.get(ip) || [];
    const recent = previous.filter(t => now - t < 60000);
    recent.push(now);
    this.attempts.set(ip, recent);
    if (this.attempts.size > 2000) this.attempts.clear();
    return recent.length <= 12;
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
    if (path === '/logout') {
      const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
      if (token && /^[a-f0-9]{64}$/.test(token)) {
        this.sql.exec('DELETE FROM sessions WHERE hash = ?', await hash(token));
      }
      return reply({ok:true});
    }
    if (path !== '/register' && path !== '/login') return reply({error:'Not found'}, 404);
    if (!this.limit(request)) return reply({error:'Too many attempts. Try again in a minute.'}, 429);
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
  sockets() { return this.ctx.getWebSockets(); }
  broadcast(message, except = null) {
    const json = JSON.stringify(message);
    for (const socket of this.sockets()) {
      if (socket === except || !socket.deserializeAttachment()?.id) continue;
      try { socket.send(json); } catch {}
    }
  }
  async fetch(request) {
    if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') return reply({error:'WebSocket required'}, 426);
    if (this.sockets().length >= 80) return reply({error:'Town server is full'}, 503);
    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({});
    return new Response(null, {status:101, webSocket:client});
  }
  async webSocketMessage(ws, raw) {
    if (typeof raw !== 'string' || raw.length > 800) { ws.close(1009, 'Message too large'); return; }
    let data;
    try { data = JSON.parse(raw); } catch { ws.close(1003, 'Invalid message'); return; }
    let meta = ws.deserializeAttachment() || {};
    if (!meta.id) {
      if (data?.type !== 'hello' || typeof data.token !== 'string') { ws.close(1008, 'Sign in first'); return; }
      const auth = this.env.ACCOUNTS.get(this.env.ACCOUNTS.idFromName('accounts-v1'));
      const check = await auth.fetch('https://accounts.internal/verify', {headers:{authorization:'Bearer '+data.token}});
      if (!check.ok) { ws.close(1008, 'Session expired'); return; }
      const user = await check.json();
      const id = crypto.randomUUID();
      meta = {id, accountId:user.id, name:user.username, expiresAt:user.expiresAt,
        zone:'town', x:0, y:0, z:0, yaw:0, last:0, ready:false};
      ws.serializeAttachment(meta);
      const players = this.sockets().filter(s => s !== ws).map(s => s.deserializeAttachment())
        .filter(p => p?.id && p.ready).map(({id,name,zone,x,y,z,yaw})=>({id,name,zone,x,y,z,yaw}));
      send(ws, {type:'welcome', id, name:user.username, players});
      return;
    }
    if (Date.now() > meta.expiresAt) { ws.close(1008, 'Session expired'); return; }
    if (data?.type !== 'state') return;
    const {zone,x,y,z,yaw} = data;
    if (!validZone(zone) || !finite(x,12000) || !finite(z,12000) ||
        !finite(y,500) || !finite(yaw,1000)) return;
    const now = Date.now();
    if (now - meta.last < 120) return; // 8 updates/second max per client
    const first = !meta.ready;
    meta = {...meta,zone,x,y,z,yaw,last:now,ready:true};
    ws.serializeAttachment(meta);
    this.broadcast({type:first?'join':'state',id:meta.id,name:meta.name,zone,x,y,z,yaw}, ws);
  }
  webSocketClose(ws) {
    const meta = ws.deserializeAttachment();
    if (meta?.id && meta.ready) this.broadcast({type:'leave',id:meta.id}, ws);
  }
  webSocketError(ws) { this.webSocketClose(ws); }
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
    if (url.pathname === '/health') return new Response(JSON.stringify({ok:true,service:'repo-town-multiplayer',protocol:1}),{headers:{...JSON_HEADERS,...cors}});
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
      body:request.method === 'POST'?request.body:null
    });
    const response = await env.ACCOUNTS.get(env.ACCOUNTS.idFromName('accounts-v1')).fetch(internal);
    const headers = new Headers(response.headers);
    for (const [key,value] of Object.entries(cors)) headers.set(key,value);
    headers.set('cache-control','no-store');
    return new Response(response.body,{status:response.status,headers});
  }
};
