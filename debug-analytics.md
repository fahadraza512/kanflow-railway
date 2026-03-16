# Analytics Not Working - Debugging Guide

## Issue

Analytics page at `/analytics` is not showing data for the active workspace even though projects, boards, and tasks exist.

## Root Cause Analysis

The analytics endpoint `/api/v1/analytics/workspace/:workspaceId` requires:

1. Valid workspace ID
2. Projects in that workspace
3. Boards in those projects
4. Tasks in those boards

## Debugging Steps

### 1. Check if Workspace ID is Being Passed

Open browser DevTools (F12) → Console tab, and check:

```javascript
// In the analytics page, check what workspace ID is being used
console.log("Active Workspace:", activeWorkspace);
console.log("Workspace ID:", activeWorkspace?.id);
```

**Expected**: Should show a valid workspace ID (number or string)
**If undefined**: The workspace store is not properly set

### 2. Check Network Request

Open DevTools → Network tab → Filter by "analytics"

Look for request to: `/api/v1/analytics/workspace/{id}`

**Check:**

- Is the request being made?
- What's the workspace ID in the URL?
- What's the response status code?
- What's the response body?

**Common Issues:**

- 401 Unauthorized → Token expired or missing
- 404 Not Found → Wrong workspace ID or route not registered
- 200 OK but empty data → No projects/boards/tasks in workspace

### 3. Verify Data Exists in Database

The analytics service queries in this order:

1. Projects (where workspaceId = X and isArchived = false)
2. Boards (where projectId IN [...] and isArchived = false)
3. Tasks (where boardId IN [...] and isArchived = false)

**If any step returns empty, analytics will show zeros.**

### 4. Test the API Directly

Open a new terminal and test the endpoint:

```bash
# Replace with your actual workspace ID and token
curl -X GET "https://sublime-spontaneity-production-f256.up.railway.app/api/v1/analytics/workspace/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "projects": { "total": 1, "active": 1 },
  "boards": { "total": 1 },
  "tasks": {
    "total": 5,
    "completed": 2,
    "inProgress": 2,
    "todo": 1,
    "overdue": 0,
    "completionRate": 40
  }
}
```

### 5. Check Frontend Configuration

Verify `frontend/.env.local` has:

```env
NEXT_PUBLIC_API_BACKEND_ENABLED=true
NEXT_PUBLIC_API_URL=/api/v1
```

### 6. Common Fixes

#### Fix 1: Workspace ID Type Mismatch

The workspace ID might be a number but being passed as string or vice versa.

**Solution**: Ensure consistent type conversion in `analytics/page.tsx`:

```typescript
activeWorkspace?.id?.toString();
```

#### Fix 2: API Backend Not Enabled

Check if `isApiBackendEnabled()` returns true.

**Solution**: Set `NEXT_PUBLIC_API_BACKEND_ENABLED=true` in `.env.local`

#### Fix 3: No Data in Workspace

The workspace exists but has no projects/boards/tasks.

**Solution**: Create at least one project → board → task to see analytics

#### Fix 4: Archived Items

All items might be archived.

**Solution**: Check database:

```sql
SELECT * FROM projects WHERE "workspaceId" = 1 AND "isArchived" = false;
SELECT * FROM boards WHERE "projectId" IN (SELECT id FROM projects WHERE "workspaceId" = 1) AND "isArchived" = false;
SELECT * FROM tasks WHERE "boardId" IN (SELECT id FROM boards WHERE "projectId" IN (SELECT id FROM projects WHERE "workspaceId" = 1)) AND "isArchived" = false;
```

## Quick Test

1. Open `/analytics` page
2. Open DevTools Console
3. Run this:

```javascript
// Get current workspace
const ws = JSON.parse(localStorage.getItem("workspace-storage"));
console.log("Workspace Store:", ws);
console.log("Active Workspace ID:", ws?.state?.activeWorkspace?.id);

// Check if API is enabled
console.log(
  "API Backend Enabled:",
  process.env.NEXT_PUBLIC_API_BACKEND_ENABLED,
);

// Manually fetch analytics
fetch(`/api/v1/analytics/workspace/${ws?.state?.activeWorkspace?.id}`, {
  headers: {
    Authorization: `Bearer ${JSON.parse(localStorage.getItem("auth-storage"))?.state?.token}`,
  },
})
  .then((r) => r.json())
  .then((data) => console.log("Analytics Data:", data))
  .catch((err) => console.error("Analytics Error:", err));
```

## Expected Behavior

✅ **Working**: Analytics page shows metrics for projects, boards, and tasks
❌ **Not Working**: Shows all zeros or loading state forever

## Next Steps

After running the debugging steps above, you should see one of these:

1. **Workspace ID is undefined** → Fix workspace store initialization
2. **API returns 401** → Token expired, re-login
3. **API returns empty data** → No projects/boards/tasks in workspace
4. **API returns 404** → Backend route not registered (check Railway deployment)
5. **Network request not made** → Frontend not calling API (check isApiBackendEnabled)

Let me know what you find and I'll help fix it!
