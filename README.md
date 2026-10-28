# GigPilot AI — early local prototype

A single-user, manual-review-first workspace. It is **not a production deployment or a completed implementation of the master specification**. It stores user-entered evidence, editable listing drafts, versions, manual approvals and an activity log in SQLite. A local Ollama model can generate a starting draft when installed. It never publishes or accesses marketplace accounts. Approval means only “approved for manual submission”; it is not a marketplace confirmation.

## Windows 11: run locally

Prerequisites: Windows 11, PowerShell, Node.js 22 LTS (including npm), and Git. `better-sqlite3` may require the Visual Studio C++ Build Tools and Python if a compatible prebuilt binary is not available. No paid API is required. Commands below assume you are in the repository folder:

```powershell
node --version
npm --version
npm ci
Copy-Item .env.example .env.local
notepad .env.local
```

Replace `APP_PASSWORD` with a unique password of at least 12 characters. Replace `SESSION_SECRET` with a unique random string of at least 32 characters. Generate one in PowerShell with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never share or commit these values. Save the file and run:

```powershell
npm run dev
```

Open `http://localhost:3000`, sign in with the configured password, and add your own evidence or create a draft. Stop the server with Ctrl+C. Data lives in `data/gigpilot.sqlite`. The dev server binds to all interfaces for preview compatibility; use a firewall to restrict port 3000 to your machine. Do **not** expose it publicly. The application is not hardened for internet-facing or multi-user deployment.

### Optional local AI (Ollama)

Install Ollama for Windows from its official site, start it, then run:

```powershell
ollama pull llama3.2
ollama list
```

The default `.env.local` points to `http://localhost:11434` and `llama3.2`. The model download and inference need sufficient disk space and memory. In the draft editor, select a marketplace, describe your idea, and choose **Generate with Ollama**. Generation replaces the editor contents. Check every assertion, package price, delivery time and suggested portfolio item. Model output is validated, but it may still be inaccurate. Failure does not produce a fake draft. The successful model path has not been tested in this environment because Ollama is unavailable.

### Optional Docker Compose

Docker Desktop with Compose is required; this environment does not have Docker, so the following configuration is **not tested**. From PowerShell:

```powershell
Copy-Item .env.example .env
notepad .env
# Set the same strong password and signing secret as above.
docker compose up --build -d
docker compose exec ollama ollama pull llama3.2
```

Visit `http://localhost:3000`. `docker compose down` stops services without deleting named volumes; `docker compose down -v` permanently deletes those volumes. The Compose port is bound to localhost. Container image tags are pinned, but images are not pinned by digest. The model is downloaded separately.

## What works and what does not

| Feature | Status |
| --- | --- |
| Single shared-password sign-in, signed HTTP-only session, same-origin POST checks | Implemented for local single-user use; API smoke tested. Not production authentication. |
| User-entered source URLs, observations, date, buyer, problem, self-assessed confidence | Implemented and schema-tested. No automatic validation of evidence. |
| Manual draft editor, save versions, restore versions | Implemented and API smoke tested. Three-tier scope/pricing may be entered as text; no structured package calculations. |
| Ollama generation with validated JSON | Implemented; unavailable-server failure tested, successful generation **not tested**. Requires a local model. |
| Basic heuristic compliance reminders | Implemented and unit tested; incomplete, not legal advice, and not marketplace approval. |
| Manual approval bound to an exact saved version | Implemented and API smoke tested; viewing content and entering it on the marketplace are the user's responsibility. |
| Official documentation links and manual-only marketplace guide | Implemented; records are partial and capabilities not verified remain unknown. |
| Marketplace connection, remote listing creation, metrics, messaging | **Unsupported**. No API integrations, publishing simulations or connected accounts are presented as real. |
| Automated discovery, scoring, price/competition data, analytics, revenue, notifications, durable jobs, n8n | **Not implemented**. No fabricated measurements or rankings. |
| PostgreSQL/Prisma/NestJS/Redis, organizations, OAuth, token encryption, OpenAPI, webhooks | **Not implemented**. The prototype uses Next.js route handlers and SQLite instead. |
| Per-field AI regeneration, version diffs, asset manager, dark mode | **Not implemented**. |
| Browser E2E, real marketplace sandbox, successful Ollama generation | **Not tested**. |

The UI supports manual submission only. It does not verify any specific marketplace listing format, package rules, category, price minimum, account, permissions, rate limits or current policy compliance. Always consult the official current documentation, marketplace interface, and applicable terms. Human judgment is essential.

## Marketplace review (reviewed 2026-10-28)

* **Fiverr**: [Creating a Gig](https://help.fiverr.com/hc/en-us/articles/360010451397-Creating-a-Gig) describes desktop gig creation. [Community Standards](https://help.fiverr.com/hc/en-us/articles/32242973123985-Our-Community-Standards) prohibit unauthorized access and scraping. A seller listing API was not verified.
* **Upwork**: [API documentation](https://developer.upwork.com/) and [automation guidance](https://support.upwork.com/hc/en-us/articles/43342677368467-Use-bots-and-other-automation-properly) require approved access and use-case permissions. [API key requirements](https://support.upwork.com/hc/en-us/articles/115015857647-Request-an-API-Key) describe eligibility, restrictions and no third-party sandbox. A project listing creation integration was not verified or built.
* **Freelancer.com**: [official developer site](https://developers.freelancer.com/) advertises an API centered on hiring; seller listing creation and scope were not verified.
* **PeoplePerHour**: [manual](https://www.peopleperhour.com/static/manual) links to its terms. A supported public seller-listing API was not verified.
* **Contra**: [official MCP](https://contra.com/features/mcp) describes authorized account interactions; [terms](https://contra.com/policies/terms) restrict circumvention of limits. Listing creation and permissions were not verified.

Each platform is therefore marked manual-only **in this app**, not claimed to lack any possible API. Scopes, rate limits, data access, categories, field limits and pricing rules remain unknown until reviewed for a particular approved integration. No CAPTCHA, MFA, restrictions or anti-bot controls are bypassed.

## Tests

```powershell
npm test
npm run build
npm audit
```

The unit tests run without a server. An additional local API smoke test is skipped by default. It creates test records and **does not delete them**, so only run it against a disposable workspace database and a running local server with Ollama stopped:

```powershell
$env:TEST_BASE_URL="http://localhost:3000"
$env:TEST_PASSWORD="your-local-workspace-password"
npm test
Remove-Item Env:TEST_BASE_URL, Env:TEST_PASSWORD
```

The smoke test exercises sign-in, CSRF origin rejection, validation, saving, approval, approval invalidation on edit, restore, logout, and unavailable Ollama. It does not publish to any marketplace. Last run here: five tests passed including the local smoke test; build passed; `npm audit` reported zero vulnerabilities. Docker, browsers, real model inference and real marketplace integrations were not tested.

## Security, deployment, backup and recovery

This is a single-user local prototype, not a hosted multi-tenant system. The shared password and signing secret are supplied through the server environment; no marketplace credentials are collected. Sessions expire after eight hours and are invalidated when the signing secret changes. Same-origin checks protect POSTs, and login throttling is in-memory only (not shared across processes or durable). For a real deployment, add independently managed user identities, durable rate limits, access control, CSRF and proxy-hardening review, secure TLS, monitoring, authorization tests, secret rotation and a security audit. Do not use the preview credentials for real data. When `PREVIEW_HOST` is explicitly configured, the embedded preview can also receive a signed session token accessible to JavaScript and held in memory for cookie-blocked browsers; it is cleared on logout or reload, and is more exposed to XSS than the normal HTTP-only cookie. This fallback is for the disposable preview only, not production. Do not rely on the audit log as tamper-proof. AI failures and operations are logged locally; no personal-data redaction or retention controls are implemented.

To back up a local database safely, stop the app first, then copy `data/gigpilot.sqlite` to encrypted storage. Do not copy a live SQLite file without its WAL; for online backup use SQLite's backup API. To recover, stop the app, restore the database to `data/gigpilot.sqlite`, remove any stale `-wal` and `-shm` files from the old database, and restart. Test recovery on a separate machine. Docker named-volume backup requires a separate Docker volume backup procedure; do not assume `docker compose down -v` preserves it.

## Troubleshooting

* **Configuration error at sign-in**: verify `.env.local` exists and has a 12+ character password and 32+ character secret, then restart Next.js.
* **Native module install fails on Windows**: install Node 22 LTS, Python and Visual Studio C++ Build Tools, then rerun `npm ci`.
* **Ollama unavailable**: start Ollama, run `ollama list`, pull the configured model, and check `OLLAMA_URL` / `OLLAMA_MODEL`. The server only accepts `localhost`, `127.0.0.1`, or the Compose service `ollama` for this URL.
* **Invalid model JSON**: try again with a suitable model or write the draft manually. Nothing is silently fabricated.
* **Approval rejected**: save a title, description, packages, requirements and FAQ first, then review the saved version.
* **Port already in use**: stop the other process or use `npm run dev -- --port 3001`, then visit that port.
