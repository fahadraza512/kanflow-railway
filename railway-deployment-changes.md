# Railway Deployment — Required Changes

## Project Overview

- **Backend**: NestJS (Node.js) — `backend/`
- **Frontend**: Next.js 14 — `frontend/`
- **Database**: PostgreSQL (Railway plugin)
- **Email**: Nodemailer with Gmail (`service: 'gmail'` preset — works on Railway)
- **File Uploads**: Local disk `./uploads` — use Railway Volume to persist
- **Real-time**: SSE (Server-Sent Events)
- **Payments**: Stripe (optional, dummy mode works without it)

---

## Railway Services to Create

| Service            | Type              |
| ------------------ | ----------------- |
| `kanflow-backend`  | Node.js           |
| `kanflow-frontend` | Node.js           |
| `kanflow-db`       | PostgreSQL plugin |

---

## Code Changes (Already Applied)

### 1. `backend/src/main.ts`

Listen on `0.0.0.0` so Railway's internal network can reach the server.

```ts
await app.listen(port, "0.0.0.0");
```

### 2. `backend/src/database/database.module.ts`

Support Railway's `DATABASE_URL` connection string with SSL. Falls back to individual vars for local dev.

### 3. `frontend/next.config.mjs`

Production API rewrite — proxies `/api/v1/*` to the backend Railway URL via `NEXT_PUBLIC_API_URL` env var. Works in both dev and production.

### 4. `frontend/src/hooks/useRealtimeNotifications.ts`

SSE connection now uses a relative `/api/v1/notifications/stream` URL instead of a hardcoded `localhost` fallback. Goes through the Next.js rewrite proxy.

### 5. `frontend/src/config/app.config.ts`

Removed hardcoded `localhost:3001` fallback — now falls back to `/api/v1` (relative, works via rewrite).

### 6. `backend/src/email/email.service.ts`

When `SMTP_HOST` is Gmail, uses Nodemailer's built-in `service: 'gmail'` preset. This bypasses Railway's port 587 block. Still 100% Nodemailer — no other library.

### 7. `backend/railway.toml` + `frontend/railway.toml`

Railway config files pinning build/start commands and health check paths.

---

## Environment Variables

### Backend (set in Railway dashboard)

```
NODE_ENV=production

# Railway auto-sets this when you add the Postgres plugin
DATABASE_URL=<auto-provided by Railway>

# JWT
JWT_SECRET=<strong random string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<strong random string>
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=<your client id>
GOOGLE_CLIENT_SECRET=<your client secret>
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/google/callback

# Email — Nodemailer with Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=<16-char Gmail App Password>
APP_NAME=KanFlow
SALES_EMAIL=your-email@gmail.com

# URLs
FRONTEND_URL=https://your-frontend.railway.app
CORS_ORIGIN=https://your-frontend.railway.app
INVITATION_BASE_URL=https://your-frontend.railway.app

# Stripe (optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID_MONTHLY=price_...
STRIPE_PRO_PRICE_ID_ANNUAL=price_...

# Features
INVITE_FEATURE_ENABLED=true
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=5242880
```

### Frontend (set in Railway dashboard)

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_INVITE_FEATURE_ENABLED=true
```

---

## Gmail App Password (required for Nodemailer on Railway)

Railway blocks port 587. The fix is `service: 'gmail'` in Nodemailer + a Gmail App Password:

1. Go to [myaccount.google.com](https://myaccount.google.com) → Security
2. Enable **2-Step Verification**
3. Search **App Passwords** → create one for "Mail"
4. Use the 16-character password as `SMTP_PASS` in Railway

---

## File Uploads (Persistent Storage)

Railway containers are ephemeral — `./uploads` is wiped on redeploy.

**Fix:** Add a Railway Volume in the dashboard:

- Mount path: `/app/uploads`
- Set env var: `UPLOAD_DIR=/app/uploads`

No code changes needed.

---

## Google OAuth

Add the production callback URL in Google Cloud Console:

```
https://your-backend.railway.app/api/v1/auth/google/callback
```

---

## Stripe Webhook (if using real Stripe)

Register in Stripe dashboard:

```
https://your-backend.railway.app/api/v1/stripe/webhook
```

---

## Deploy Order

1. Create Railway project
2. Add PostgreSQL plugin → copy `DATABASE_URL`
3. Deploy backend service → set all backend env vars
4. Deploy frontend service → set `NEXT_PUBLIC_API_URL` to backend URL
5. Add Railway Volume to backend for uploads
6. Update Google OAuth callback URL
