// Hands the Google Maps JavaScript API *browser* key to narromine-compare.html.
// A Maps JavaScript key is visible to any page that uses it by design; it is protected by its
// HTTP-referrer and API restrictions in Google Cloud, not by secrecy. Keeping it in a Vercel
// environment variable (GOOGLE_MAPS_BROWSER_KEY) keeps it out of this public Git repository.
export default function handler(req, res) {
  const key = String(process.env.GOOGLE_MAPS_BROWSER_KEY || '').trim();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.statusCode = 200;
  res.end(JSON.stringify({ key: key || null }));
}
