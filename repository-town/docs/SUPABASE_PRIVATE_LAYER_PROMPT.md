# Prompt: login-gated private layer for Repository Town (Supabase)

Copy everything below the line into ChatGPT (or another coding agent with access to the
JoshMemory repo and a Supabase account).

---

You are working on Repository Town, a static three.js site published to GitHub Pages
(https://parris-tech-services.github.io/Repository-town/). Source: repo
`joshualparris/JoshMemory`, folder `repository-town/` (read `repository-town/CLAUDE.md` and
`COORDINATION.md` first and follow them). The public build is deliberately sanitised: private
repository slugs, URLs, READMEs and descriptions never appear in it, and
`node tools/check_privacy.mjs` enforces that.

Goal: the owner (Josh) can sign in on the public site with a username and password and then
see the full private details of every house. Anyone else sees only the sanitised town.

Because GitHub Pages can't protect files, the private data must live only in Supabase and be
returned only to an authenticated, allow-listed user. Never put private data in the static build.

## 1. Supabase project
- Create a new free project named `repository-town` (region ap-southeast-2). Do not reuse
  any existing project. Josh's other projects hold client and health records.
- Auth: email and password only. Turn OFF public sign-ups. Create one user for Josh in
  the dashboard. If he wants a plain username, map it to an email in the client
  (`josh` → `josh@repository-town.invalid`) and create the user with that email.
- SQL migration:
  ```sql
  create table public.town_owners (user_id uuid primary key references auth.users on delete cascade);
  create table public.private_houses (
    coordinate text primary key,          -- e.g. 'H1', matches houses in the public build
    real_name text not null,
    repo_slug text,
    repo_url text,
    description text,
    readme text,
    extra jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
  );
  alter table public.town_owners enable row level security;
  alter table public.private_houses enable row level security;
  create policy "owners read their row" on public.town_owners
    for select to authenticated using (user_id = (select auth.uid()));
  create policy "owners read private houses" on public.private_houses
    for select to authenticated
    using (exists (select 1 from public.town_owners o where o.user_id = (select auth.uid())));
  -- No insert/update/delete policies: only the service role (used by the local upload script) writes.
  ```
  Then insert Josh's auth user id into `town_owners`. Run the security advisor afterwards and fix anything it reports.

## 2. Upload script (runs only on Josh's machine)
- Add `repository-town/tools/upload_private.mjs`. It reads the private master inventory
  that the build already uses for the private offline copy (`release/Repository-Town.html`
  data). Find where `tools/build.mjs` gets the full details. It then upserts one row per
  house into `private_houses`.
- It reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from environment variables
  only. Never commit the service-role key, never write it to a file in the repo, and never ship it
  to the browser. Add a `.env.example` with empty values and make sure `.env` is git-ignored.

## 3. Client (public site)
- Add `src/ui/private-login.js`. Load `@supabase/supabase-js` from a pinned CDN version
  (for example `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm`), lazily, only when the
  user opens the login.
- Put only the project URL and the publishable (anon) key in `src/config.js`. These are designed to be
  public; Row Level Security is what protects the data.
- UI: a small "🔒 Owner sign-in" button in the HUD opens a panel with a username and password,
  Sign in and Sign out. Show clear errors ("Wrong username or password", "Signed in, but this
  account is not on the owner list").
- After sign-in, `select * from private_houses` and apply it as an in-memory overlay: house
  labels, the house card, the resident's facts, the archive panel (README, links) use the real
  values when present. Keep private data in memory only. No localStorage or IndexedDB copies
  (supabase-js storing its own session token is fine). Sign out clears the overlay and reloads
  labels.
- The NPC chat may use the private facts only while signed in. The Cloudflare worker stays as
  it is; no new secrets in client code.

## 4. Checks (must all pass before publishing)
- `node tools/build.mjs && node tools/check_privacy.mjs`: the public build still has no private
  markers. Extend the check to fail if `service_role` or a JWT with role `service_role`
  appears anywhere in `dist/public`.
- Add `tests/private-login.mjs` (Playwright): stub the Supabase REST and auth endpoints with
  `page.route` and check the following. Signed out, the town shows sanitised names. Signing in
  with the stub shows the real name on one house and in its archive panel. Signing out
  restores the sanitised name. Nothing private is in localStorage at any point.
- Run the existing suites listed in `CLAUDE.md` (e2e, life, people, npc, shop-e2e).
- Manually: on the published site, confirm the anonymous REST call
  `GET <SUPABASE_URL>/rest/v1/private_houses` with only the anon key returns `[]`.

## 5. Ship
- Work on a topic branch, merge to `main` after tests, record the work in `COORDINATION.md`,
  publish with `tools/publish_pages.sh`.
- Tell Josh how to run the upload script and how to change his password (Supabase dashboard
  → Authentication → Users).
