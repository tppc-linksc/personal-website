# Personal Vibe Coding Portfolio

Next.js 16 + TypeScript + Tailwind + Framer Motion + React Three Fiber + CloudBase.

## 1) Run locally

```bash
npm install
npm run dev
```

Open:
- Frontend: `http://localhost:3000` (redirects to `/zh`)
- Studio login: `http://localhost:3000/studio/login`
- Studio CMS: `http://localhost:3000/studio`

## 2) CloudBase setup (no-redeploy content updates)

The site reads project data from CloudBase at runtime.
When CloudBase is unavailable, it falls back to local seed data.

Copy `.env.example` to `.env.local`:

- `CLOUDBASE_ENV_ID`
- `CLOUDBASE_API_KEY` **or** (`CLOUDBASE_SECRET_ID` + `CLOUDBASE_SECRET_KEY`)
- studio admin credential: choose one
  - `STUDIO_ADMIN_TOKEN` (plain, compatible mode)
  - `STUDIO_ADMIN_TOKEN_HASH` (recommended)

Optional:
- `CLOUDBASE_PROJECTS_COLLECTION` (default `portfolio_projects`)
- `CLOUDBASE_COVER_DIR` (default `portfolio-covers`)
- `CLOUDBASE_MESSAGES_COLLECTION` (default `project_messages`)
- `STUDIO_SESSION_SECRET` (recommended, independent signing secret)
- `STUDIO_SESSION_TTL_SECONDS` (default 259200, i.e. 3 days)
- `STUDIO_OWNER_NAME` (default `Author`, used for owner-labeled replies)

Generate `STUDIO_ADMIN_TOKEN_HASH` from your memorable plain token:

```bash
npm run studio:hash -- "your-plain-token"
```

Paste the output (format `sha256:<salt>:<hash>`) into `.env.local`.

## 3) Studio CMS (single-page management)

`/studio` is now a 3-stage CMS:

1. `基础信息`:
- slug, project status, bilingual title/tagline

2. `内容信息`:
- bilingual summary/description/design/architecture
- tech tags

3. `发布信息`:
- cover path + image upload to CloudBase storage
- github/live/video links
- eta/progress
- `保存草稿` / `发布上线`

### Publish model

- `draft`: hidden from frontend
- `published`: visible on frontend

The public pages only show `published` projects.

### Studio security

- Route protected by `proxy.ts`: unauthenticated requests to `/studio` are redirected to `/studio/login`
- `/studio/login` verifies admin token (plain or hash mode) and issues an httpOnly signed session cookie
- Write APIs (`/api/projects`, `/api/studio/upload`) require valid session/token

## 4) API and runtime behavior

- `GET /api/projects`:
  - public list (published only)
- `GET /api/projects?scope=all`:
  - full list (requires studio auth)
- `POST /api/projects`:
  - seed / upsert / delete (requires studio auth)
- `POST /api/studio/upload`:
  - upload cover image to CloudBase storage (requires studio auth)

After write operations, paths are revalidated to refresh frontend content.

## 5) Data model and sources

Schema:
- `lib/projects.ts` (`ProjectItem`, bilingual fields, visibility)

CloudBase adapter:
- `lib/cloudbase-projects.ts`

Runtime source + fallback:
- `lib/projects-source.ts`

Studio auth:
- `lib/studio-auth.ts`

Messages:
- `lib/messages.ts`
- `lib/cloudbase-messages.ts`
- `lib/messages-source.ts`
- `app/api/projects/[slug]/messages/route.ts`

## 6) Build checks

```bash
npm run lint
npm run build
```
