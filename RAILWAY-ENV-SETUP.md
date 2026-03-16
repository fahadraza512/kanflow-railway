# Railway Environment Variables Setup

## Issue: Analytics Not Working

The analytics page shows `useApiBackend: false` which means the frontend is not using the API backend.

## Root Cause

The environment variable `NEXT_PUBLIC_USE_API=true` is **NOT set in Railway**.

Environment variables starting with `NEXT_PUBLIC_` must be set at **build time** in Railway for Next.js to include them in the frontend bundle.

## Fix: Set Environment Variables in Railway

### For Frontend Service (Next.js)

Go to Railway Dashboard → Your Frontend Service → Variables tab

Add these environment variables:

```env
# CRITICAL: Enable API backend
NEXT_PUBLIC_USE_API=true

# Feature flags
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_INVITE_FEATURE_ENABLED=true

# Environment
NODE_ENV=production
```

### For Backend Service (NestJS)

Go to Railway Dashboard → Your Backend Service → Variables tab

Ensure these are set:

```env
# Database (auto-provided by Railway Postgres plugin)
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Email - Resend API
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=KanFlow <onboarding@resend.dev>
APP_NAME=KanFlow

# Frontend URL
FRONTEND_URL=https://your-frontend.railway.app
CORS_ORIGIN=https://your-frontend.railway.app

# OAuth (if using Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/google/callback

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID_MONTHLY=price_...
STRIPE_PRO_PRICE_ID_ANNUAL=price_...

# Features
INVITE_FEATURE_ENABLED=true

# File Upload
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=5242880
```

## Important Notes

### 1. NEXT*PUBLIC* Variables

Variables starting with `NEXT_PUBLIC_` are **embedded into the frontend JavaScript bundle at build time**.

This means:

- They must be set BEFORE building
- Changing them requires a **rebuild** (not just restart)
- They are visible in the browser (don't put secrets here)

### 2. Rebuild After Setting Variables

After adding `NEXT_PUBLIC_USE_API=true`:

1. Go to Railway Dashboard → Frontend Service
2. Click "Deploy" → "Redeploy"
3. Wait for build to complete
4. Test the analytics page again

### 3. Verify Environment Variables

To check if the variable is set correctly, add this to your frontend code temporarily:

```typescript
console.log("NEXT_PUBLIC_USE_API:", process.env.NEXT_PUBLIC_USE_API);
console.log("isApiBackendEnabled:", isApiBackendEnabled());
```

Expected output:

```
NEXT_PUBLIC_USE_API: true
isApiBackendEnabled: true
```

## Testing After Fix

1. Open `https://your-frontend.railway.app/analytics`
2. Open DevTools Console (F12)
3. Look for: `[Analytics Debug] { useApiBackend: true, ... }`
4. Check Network tab for API request to `/api/v1/analytics/workspace/{id}`
5. Analytics should now show data!

## Common Mistakes

❌ **Setting variable after build** - Won't work, needs rebuild
❌ **Typo in variable name** - Must be exactly `NEXT_PUBLIC_USE_API`
❌ **Setting in backend instead of frontend** - Frontend needs its own variables
❌ **Not redeploying** - Changes require rebuild

## Quick Checklist

- [ ] Set `NEXT_PUBLIC_USE_API=true` in Railway Frontend service
- [ ] Set `NEXT_PUBLIC_INVITE_FEATURE_ENABLED=true` in Railway Frontend service
- [ ] Redeploy frontend service
- [ ] Wait for build to complete
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Test analytics page
- [ ] Check console shows `useApiBackend: true`

## Still Not Working?

If analytics still shows `useApiBackend: false` after setting the variable and rebuilding:

1. Check Railway build logs for the frontend
2. Look for: "Environment variables loaded" or similar
3. Verify the variable appears in the build output
4. Try a hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
5. Check if service worker is caching old version (disable in DevTools)

## Alternative: Force API Backend

If you can't set environment variables, you can hardcode it temporarily:

In `frontend/src/config/app.config.ts`:

```typescript
export const FEATURE_FLAGS = {
  // Force API backend to true
  USE_API_BACKEND: true, // Changed from: process.env.NEXT_PUBLIC_USE_API === 'true'
  // ... rest of config
};
```

⚠️ **Not recommended for production** - Use environment variables instead!
