# How to Download Everything and Leave Replit

## Step 1: Download Your Code

### Option A: Download as ZIP (Easiest)
1. In the Files panel (left sidebar), click the **three dots (⋮)**
2. Select **"Download as zip"**
3. Save the file to your computer
4. Unzip it

### Option B: Clone via Git
```bash
# From your local computer
git clone https://[your-replit-url].git american-split-ai
cd american-split-ai
```

---

## Step 2: Download Your Database

Your database has been exported to two files in this workspace:

### Full Database (Schema + All Data including 11 songs)
**File**: `/tmp/american-split-ai-FULL-DUMP.sql`

**To download:**
1. In Replit Files panel, navigate to `/tmp/`
2. Right-click `american-split-ai-FULL-DUMP.sql`
3. Select "Download"

**Or via command line:**
```bash
# In Replit Shell
cat /tmp/american-split-ai-FULL-DUMP.sql
# Copy the output to a local file
```

### Schema Only (If you just want the structure)
**File**: `/tmp/database_schema.sql`

Download same way as above.

---

## Step 3: Download Your Song Files

Your 11 songs are stored in Replit Object Storage:
- Bucket: `replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f`
- Path: `/public/songs/`

### Option A: Via Replit Object Storage Tool
1. Click **"Tools"** in left sidebar
2. Click **"Object Storage"**
3. Navigate to the `public/songs/` folder
4. Download each song file individually

### Option B: Note Song Paths from Database
The database dump includes all song metadata with their object storage paths. You can:
1. Set up new object storage on your new platform
2. Re-upload the songs via the admin panel
3. The database will update automatically

---

## Step 4: Save Your Environment Variables

You'll need these on your new platform:

### Copy from Replit Secrets

1. Go to **Tools → Secrets** in Replit
2. Copy these values:

```bash
# Object Storage (you'll replace these on new platform)
PUBLIC_OBJECT_SEARCH_PATHS=<copy from Replit>
DEFAULT_OBJECT_STORAGE_BUCKET_ID=<copy from Replit>

# ACRCloud (keep these same)
ACRCLOUD_ACCESS_KEY=<copy from Replit>
ACRCLOUD_ACCESS_SECRET=<copy from Replit>
ACRCLOUD_HOST=<copy from Replit>
ACRCLOUD_BUCKET_ID=<copy from Replit>
ACRCLOUD_BEARER_TOKEN=<copy from Replit>

# Session (generate new random string for new platform)
SESSION_SECRET=<copy from Replit or generate new>

# Database (will be different on new platform)
DATABASE_URL=<will be provided by new platform>
```

---

## Step 5: Choose Your New Platform

See `EXPORT_PACKAGE.md` for detailed migration guides for:
- **Vercel** (easiest for React apps)
- **Railway** (simplest for full-stack)
- **Render** (free tier with PostgreSQL)
- **DigitalOcean** (good balance)
- **AWS** (most control)

---

## Step 6: Set Up on New Platform

### Typical Setup Process:

1. **Create account** on chosen platform
2. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/american-split-ai.git
   git push -u origin main
   ```

3. **Create new project** on platform (import from GitHub)

4. **Add PostgreSQL database** (varies by platform)

5. **Set environment variables** in platform dashboard

6. **Deploy**

7. **Import database:**
   ```bash
   psql NEW_DATABASE_URL < american-split-ai-FULL-DUMP.sql
   ```

8. **Set up object storage** (S3, R2, etc.)

9. **Re-upload songs** via admin panel or migration script

10. **Test everything works**

---

## Files You Need to Download

From this Replit workspace:

✅ **All code** (via zip download or git clone)  
✅ **Database dump**: `/tmp/american-split-ai-FULL-DUMP.sql`  
✅ **Database schema**: `/tmp/database_schema.sql`  
✅ **Songs**: Via Object Storage tool (11 files)  
✅ **Environment variables**: From Tools → Secrets  

---

## What You're Taking With You

- ✅ Complete working application (React + Express + TypeScript)
- ✅ All 11 songs and metadata
- ✅ Complete database with all challenges and data
- ✅ Admin panel fully functional
- ✅ ACRCloud integration configured
- ✅ Modern tech stack (Vite, Shadcn UI, Drizzle ORM)

---

## Quick Migration Checklist

- [ ] Download code (zip or git clone)
- [ ] Download database dump (`/tmp/american-split-ai-FULL-DUMP.sql`)
- [ ] Download songs from Object Storage tool
- [ ] Copy environment variables from Secrets
- [ ] Choose new platform
- [ ] Push code to GitHub
- [ ] Set up PostgreSQL on new platform
- [ ] Import database dump
- [ ] Set environment variables
- [ ] Set up object storage (S3/R2/etc)
- [ ] Upload songs to new storage
- [ ] Deploy
- [ ] Test at new URL

---

## Support

All deployment guides and documentation are in:
- `EXPORT_PACKAGE.md` - Complete migration guide
- `PRODUCTION_DEPLOYMENT.md` - Deployment reference
- `replit.md` - Architecture documentation

---

## You're All Set

Your app is solid. The code works. You're just changing where it runs.

Good luck! 🚀
