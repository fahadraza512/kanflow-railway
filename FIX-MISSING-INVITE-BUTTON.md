n# Fix: Missing "Invite Member" Button

## Problem

The "Invite Member" button is not showing on the `/settings/members` page.

## Root Cause

The button is hidden because the `NEXT_PUBLIC_INVITE_FEATURE_ENABLED` environment variable is not set to `true` in Railway.

## Solution

### Step 1: Add Environment Variable in Railway

1. Go to https://railway.app
2. Select your project
3. Click on your **Frontend service** (Next.js app)
4. Click on the "Variables" tab
5. Click "New Variable"
6. Add:
   ```
   NEXT_PUBLIC_INVITE_FEATURE_ENABLED=true
   ```
7. Click "Add"

### Step 2: Redeploy Frontend

After adding the variable:

1. Railway should automatically trigger a rebuild
2. If not, click "Deploy" → "Redeploy"
3. Wait for the build to complete (2-5 minutes)

### Step 3: Verify

1. Open `https://sublime-spontaneity-production-f256.up.railway.app/settings/members`
2. Press Ctrl+Shift+R (hard refresh to clear cache)
3. You should now see the "Invite Member" button

## Why This Happens

Environment variables starting with `NEXT_PUBLIC_` are:

- Embedded into the frontend JavaScript bundle at **build time**
- NOT available at runtime
- Must be set BEFORE building the frontend
- Require a rebuild when changed

## Other Missing Features?

If you notice other features missing, check if they depend on `NEXT_PUBLIC_` environment variables:

**Current Feature Flags:**

- `NEXT_PUBLIC_USE_API` - Enable API backend (for analytics, etc.)
- `NEXT_PUBLIC_INVITE_FEATURE_ENABLED` - Enable workspace invitations
- `NEXT_PUBLIC_ENABLE_MOCK_DATA` - Enable mock data (should be false in production)

## Complete Railway Frontend Environment Variables

For reference, here are ALL the environment variables your frontend needs in Railway:

```env
# API Configuration
NEXT_PUBLIC_USE_API=true

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_INVITE_FEATURE_ENABLED=true

# Environment
NODE_ENV=production
```

## Troubleshooting

### Button Still Not Showing After Rebuild?

1. **Clear browser cache**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Check build logs**: Verify the variable appears in Railway build output
3. **Inspect in browser**: Open DevTools Console and run:

   ```javascript
   console.log(
     "NEXT_PUBLIC_INVITE_FEATURE_ENABLED:",
     process.env.NEXT_PUBLIC_INVITE_FEATURE_ENABLED,
   );
   ```

   Should output: `NEXT_PUBLIC_INVITE_FEATURE_ENABLED: true`

4. **Check service worker**: Disable service worker in DevTools (Application tab → Service Workers → Unregister)

### Only Workspace Owners See the Button

Even with the feature enabled, the "Invite Member" button is only visible to:

- Workspace owners (not admins, PMs, or members)

This is by design for security. Check your role in the workspace banner at the top of the page.

## Related Issues

- Analytics not working → Need `NEXT_PUBLIC_USE_API=true`
- Other features missing → Check for `NEXT_PUBLIC_` environment variables

## Quick Test

To quickly test if the feature flag is working, you can temporarily hardcode it:

In `frontend/src/config/features.ts`:

```typescript
export const FEATURES = {
  invitations: true, // Hardcoded for testing
} as const;
```

⚠️ **Don't commit this!** Use environment variables instead.
