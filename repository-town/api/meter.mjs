// Shared Google API meter for narromine-compare.html.
// Totals are kept per calendar month (Australia/Sydney) in Upstash Redis, so every browser and
// session adds to the same count. Needs an Upstash Redis store connected to this Vercel project
// (Vercel dashboard > Storage > Upstash for Redis), which sets the env vars read below.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const month = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' }).slice(0, 7);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function redis(commands) {
  const r = await fetch(URL_ + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'content-type': 'application/json' }, body: JSON.stringify(commands) });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).map((x) => Number(x.result) || 0);
}

export async function GET() {
  if (!URL_ || !TOKEN) return json({ error: 'meter store not configured' }, 503);
  const k = 'svmeter:' + month();
  const [calls, loads] = await redis([['GET', k + ':calls'], ['GET', k + ':loads']]);
  return json({ month: month(), calls, loads });
}

export async function POST(request) {
  if (!URL_ || !TOKEN) return json({ error: 'meter store not configured' }, 503);
  let b = {}; try { b = await request.json(); } catch {}
  const calls = Math.min(5, Math.max(0, b.calls | 0)), loads = Math.min(calls, Math.max(0, b.loads | 0));   // one page can't inflate it much per request
  const k = 'svmeter:' + month(), ttl = 60 * 60 * 24 * 70;
  const [c, l] = await redis([['INCRBY', k + ':calls', calls], ['INCRBY', k + ':loads', loads], ['EXPIRE', k + ':calls', ttl], ['EXPIRE', k + ':loads', ttl]]);
  return json({ month: month(), calls: c, loads: l });
}
