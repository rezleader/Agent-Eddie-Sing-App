# Production Deployment Guide - American Split AI

**Goal:** Deploy a fresh, working production environment from scratch

---

## Prerequisites (Already Working in Development)

✅ Development environment has:
- 11 songs uploaded and working
- ACRCloud recognition functional
- Object storage configured
- All features tested

---

## Step 1: Document Current Development Configuration

Before touching production, capture what's working:

### Required Environment Variables (Copy from Development)

```bash
# Object Storage (CRITICAL - app won't work without these)
PUBLIC_OBJECT_SEARCH_PATHS=/replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f/public
DEFAULT_OBJECT_STORAGE_BUCKET_ID=replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f

# ACRCloud Music Recognition
ACRCLOUD_ACCESS_KEY=(from dev secrets)
ACRCLOUD_ACCESS_SECRET=(from dev secrets)
ACRCLOUD_HOST=(from dev secrets)
ACRCLOUD_BUCKET_ID=28354
ACRCLOUD_BEARER_TOKEN=(from dev secrets)

# Database (automatically set by Replit for production)
DATABASE_URL=(production will have its own)
PGHOST=(production will have its own)
PGPORT=(production will have its own)
PGUSER=(production will have its own)
PGPASSWORD=(production will have its own)
PGDATABASE=(production will have its own)

# Session Security
SESSION_SECRET=(generate new random string for production)
```

---

## Step 2: Tear Down Current Production (If Needed)

1. Go to Replit Deployments
2. Click on current deployment
3. Click "Unpublish" or "Delete deployment"
4. Confirm teardown

---

## Step 3: Create Fresh Production Deployment

### A. Set Environment Variables BEFORE deploying

In Replit deployment settings, add ALL these variables:

```
PUBLIC_OBJECT_SEARCH_PATHS=/replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f/public
DEFAULT_OBJECT_STORAGE_BUCKET_ID=replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f
ACRCLOUD_ACCESS_KEY=(your key)
ACRCLOUD_ACCESS_SECRET=(your secret)
ACRCLOUD_HOST=(your host)
ACRCLOUD_BUCKET_ID=28354
ACRCLOUD_BEARER_TOKEN=(your token)
SESSION_SECRET=(generate random string like: 8f9a7b6c5d4e3f2a1b0c9d8e7f6a5b4c)
```

### B. Deploy

1. Click "Deploy" in Replit
2. Wait for build to complete
3. DO NOT test uploads yet - verify configuration first

---

## Step 4: Verify Production Configuration

After deployment, check this URL:
```
https://[your-deployment-url]/api/debug/storage-config
```

Should return:
```json
{
  "environment": "production",
  "PUBLIC_OBJECT_SEARCH_PATHS": "/replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f/public",
  "DEFAULT_OBJECT_STORAGE_BUCKET_ID": "replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f",
  "configured": true
}
```

❌ If `configured: false` → environment variables NOT set correctly, fix before continuing

---

## Step 5: Populate Production Database

Production database will be empty. Two options:

### Option A: Manual Upload (Recommended for First Deployment)

1. Go to `https://[your-deployment-url]/admin`
2. Login with password: `admin123`
3. Go to "Songs"
4. Upload ONE test song first
5. If successful, upload remaining 10 songs

### Option B: Automated Migration (Advanced)

Run migration script from development:
```bash
PROD_DATABASE_URL='[production-db-url]' tsx scripts/migrate-songs-to-production.ts
```

---

## Step 6: Validation Checklist

After uploading songs, verify each feature:

- [ ] Navigate to admin panel: `https://[url]/admin`
- [ ] Login works (password: admin123)
- [ ] Songs page shows all uploaded songs
- [ ] Click a song - audio plays correctly
- [ ] Upload a new test song - succeeds without errors
- [ ] Navigate to user scanner: `https://[url]/`
- [ ] Record audio and scan - recognizes song
- [ ] Challenges appear after recognition
- [ ] Complete a challenge - points awarded
- [ ] View leaderboard - shows scores

---

## Step 7: Troubleshooting

### If uploads fail:

1. Check `/api/debug/storage-config` - is `configured: true`?
2. Check deployment logs for errors
3. Verify `PUBLIC_OBJECT_SEARCH_PATHS` exactly matches development
4. Verify object storage bucket ID is correct

### If songs don't play:

1. Check object storage bucket is accessible
2. Verify `audioPath` in database matches actual bucket location
3. Check CORS settings on object storage

### If ACRCloud fails:

1. Verify all ACRCLOUD_* environment variables are set
2. Check ACRCLOUD_BEARER_TOKEN is valid (not expired)
3. Check deployment logs for ACRCloud errors

---

## Success Criteria

Production is working when:

✅ Admin can upload songs  
✅ Songs play in browser  
✅ Users can scan audio and recognize songs  
✅ Challenges appear and can be completed  
✅ Leaderboard updates with points  

---

## Rollback Plan

If production fails completely:

1. Keep development running (don't touch it)
2. Unpublish production deployment
3. Review this checklist for missed steps
4. Try again from Step 3

---

## Notes

- Development and Production use the SAME object storage bucket
- Songs uploaded in dev are already in bucket, just need database records
- Production database is separate from development database
- The upload directory fix (`/tmp/uploads` in production) is already in code
