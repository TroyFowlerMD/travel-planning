# Travel Planning

Travel Planning is a monorepo MVP for tracking travel ideas, monitoring Google Flights fare snapshots through SerpAPI, storing fare history in Cloudflare D1, and sending daily price-drop email alerts from a Cloudflare Worker cron trigger.

## Project structure

```text
apps/web        Next.js 14 App Router dashboard with Tailwind CSS and Recharts
apps/worker     Cloudflare Worker API and cron job built with Hono.js
packages/db     Cloudflare D1 schema for fare snapshots
wrangler.toml   Worker, D1, Send Email, and cron configuration
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Cloudflare account with Workers, Pages, D1, and Email Routing enabled
- SerpAPI account with access to the Google Flights engine

## Install dependencies

```bash
npm install
```

## Cloudflare login

Authenticate Wrangler locally:

```bash
npx wrangler login
```

Confirm the account is available:

```bash
npx wrangler whoami
```

## Create and configure D1

Create the D1 database:

```bash
npx wrangler d1 create travel-planning-db
```

Copy the returned `database_id` into `wrangler.toml` under the `[[d1_databases]]` section while keeping the binding name as `DB`.

Apply the schema locally for development:

```bash
npm run db:local
```

Apply the schema to Cloudflare:

```bash
npm run db:remote
```

## Configure Worker variables and secrets

Set the SerpAPI key as a Worker secret:

```bash
npx wrangler secret put SERPAPI_KEY
```

Set the email recipient and verified sender values:

```bash
npx wrangler secret put EMAIL_TO
npx wrangler secret put EMAIL_FROM
```

`EMAIL_FROM` must be allowed by Cloudflare Email Routing, and the `EMAIL` Send Email binding is already configured in `wrangler.toml`.

To override the default routes, set `TRACKED_ROUTES` to a JSON array in the Worker environment. Each route supports `origin`, `destination`, `departDate`, `returnDate`, `currency`, and `baselinePrice`.

## Run locally

Start the Cloudflare Worker:

```bash
npm run dev:worker
```

In another terminal, start the dashboard:

```bash
npm run dev:web
```

The dashboard opens at `http://localhost:3000`, and the Worker exposes health and fare APIs at `http://localhost:8787/health` and `http://localhost:8787/api/fare-snapshots`.

## Deploy the Worker

Deploy the Worker and cron trigger:

```bash
npm run deploy -w @travel-planning/worker
```

The Worker cron is configured as `0 11 * * *`, so it refreshes fare snapshots daily at 11:00 UTC.

## Connect Cloudflare Pages

1. Open the Cloudflare dashboard.
2. Go to **Workers & Pages**.
3. Choose **Create application**.
4. Select **Pages** and connect the GitHub repository.
5. Set the project name to `travel-planning`.
6. Set the production branch to `main`.
7. Use `npm run build -w @travel-planning/web` as the build command.
8. Use `apps/web/out` as the build output directory.
9. Add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` as GitHub repository secrets for the included deployment workflow.

The included GitHub Actions workflow installs dependencies, typechecks the monorepo, builds the exported dashboard, applies the D1 schema, deploys the Worker, and publishes the Pages output on every push to `main`.

## Useful commands

```bash
npm run typecheck
npm run build
npm run db:local
npm run db:remote
npm run deploy -w @travel-planning/worker
```
