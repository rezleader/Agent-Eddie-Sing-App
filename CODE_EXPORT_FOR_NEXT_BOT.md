# American Split AI - Complete Code Export

## Critical Information for Next Developer

### **Production Issue**
File uploads fail in production with identical error every time, despite multiple fix attempts.

**What Works:**
- ✅ Development environment: 100% functional (11 songs uploaded, ACRCloud recognition working)
- ✅ Object storage: Files DO upload successfully to bucket
- ✅ Database: Schema correct, records created
- ✅ ACRCloud: Recognition works in development

**What Fails:**
- ❌ Production uploads: Return 500 error
- ❌ Suspected: ACRCloud upload step after object storage upload
- ❌ Hypothesis: File cleanup race condition OR timeout with large audio files

---

## Environment Variables (CRITICAL - Must Set in Production)

### Object Storage
```bash
PUBLIC_OBJECT_SEARCH_PATHS=/replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f/public
DEFAULT_OBJECT_STORAGE_BUCKET_ID=replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f
```

### ACRCloud Music Recognition
```bash
ACRCLOUD_ACCESS_KEY=(from Replit Secrets)
ACRCLOUD_ACCESS_SECRET=(from Replit Secrets)
ACRCLOUD_HOST=identify-us-west-2.acrcloud.com
ACRCLOUD_BUCKET_ID=28354
ACRCLOUD_BEARER_TOKEN=(from Replit Secrets - may be expired)
```

### Database (Auto-configured by Replit)
```bash
DATABASE_URL=(production has its own)
```

### Session
```bash
SESSION_SECRET=(generate random string)
```

---

## Project Structure

```
american-split-ai/
├── client/src/               # Frontend React app
│   ├── App.tsx              # Main router with admin/user routes
│   ├── pages/
│   │   ├── UserScanner.tsx  # Audio recording & recognition
│   │   ├── SongChallenges.tsx
│   │   ├── Leaderboard.tsx
│   │   └── admin/           # Admin panel
│   │       ├── AdminLayout.tsx
│   │       ├── SongsManager.tsx  # Where uploads happen
│   │       └── ChallengesManager.tsx
│   └── components/ui/       # Shadcn components
├── server/
│   ├── index.ts            # Express server setup
│   ├── routes.ts           # API endpoints (UPLOAD IS LINE 157)
│   ├── objectStorage.ts    # Object storage service
│   ├── acrcloud.ts         # Music recognition service
│   ├── acrcloud-upload.ts  # Fingerprint upload service
│   ├── storage.ts          # Database interface
│   └── vite.ts             # Vite dev server
├── shared/
│   └── schema.ts           # Database schema (Drizzle ORM)
├── scripts/
│   ├── verify-production-env.ts
│   └── migrate-songs-to-production.ts
└── PRODUCTION_DEPLOYMENT.md  # Deployment guide
```

---

## The Bug Location

**File: `server/routes.ts` - Lines 157-235**

POST /api/songs endpoint:

```typescript
app.post("/api/songs", upload.single('audioFile'), async (req, res) => {
  let tempFilePath: string | undefined;
  
  try {
    tempFilePath = req.file.path;
    
    // 1. Get audio duration
    const duration = await getAudioDuration(req.file.path);
    
    // 2. Upload to Object Storage (SUCCEEDS)
    const objectPath = await objectStorageService.uploadToPublic(
      req.file.path,
      `songs/${req.file.filename}`,
      req.file.mimetype
    );
    
    // 3. Create database record
    const validated = insertSongSchema.parse(songData);
    let song = await storage.createSong(validated);
    
    // 4. Upload to ACRCloud (FAILS IN PRODUCTION?)
    if (acrCloudUploadService.isReady()) {
      const acrId = await acrCloudUploadService.uploadAudioFile(
        req.file.path,  // May be reading deleted file?
        validated.title,
        validated.artist || "Eddie Sing & The 31 Days",
        song.id,
        validated.album || undefined
      );
      // Update song with fingerprint...
    }
    
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ error: "Failed to create song" });
  } finally {
    // Cleanup temp file in production
    if (isProduction && tempFilePath) {
      await unlink(tempFilePath);
    }
  }
});
```

---

## Attempted Fixes (All Failed)

1. ✅ Changed upload directory from `client/public/songs` to `/tmp/uploads` in production
2. ✅ Changed from `file.save()` to `bucket.upload()` for object storage
3. ✅ Added environment variable detection (`REPLIT_DEPLOYMENT=1`)
4. ✅ Moved cleanup to `finally` block to avoid race condition
5. ✅ Added `tempFilePath` tracking to prevent double cleanup
6. ❌ **Still fails with same error**

---

## Hypotheses (Unconfirmed)

### Hypothesis 1: File Cleanup Race Condition
- Cleanup happens before ACRCloud finishes reading
- **Status:** Attempted fix with finally block - STILL FAILS

### Hypothesis 2: Timeout with Large Files
- Audio files are 3-5 minutes (5-10MB)
- Request may timeout before upload completes
- **Status:** Not investigated - need to check Express timeout settings

### Hypothesis 3: Production Environment Issues
- Object storage credentials not working in production
- ACRCloud credentials expired/invalid in production
- Network issues between production and external services
- **Status:** Cannot verify without production logs

---

## What Next Developer Should Do

### 1. Get Production Logs
**CRITICAL:** Need actual production error logs to see what's failing.

Check production deployment logs for:
- Stack traces from upload endpoint
- ACRCloud upload errors
- Object storage errors
- Timeout errors

### 2. Verify Environment Variables
Run this in production:
```bash
curl https://[your-deployment-url]/api/debug/storage-config
```

Should return:
```json
{
  "environment": "production",
  "configured": true,
  "PUBLIC_OBJECT_SEARCH_PATHS": "..."
}
```

### 3. Test Upload Step-by-Step

Add logging to `server/routes.ts` line 157:

```typescript
console.log('[UPLOAD] Step 1: Received file:', req.file.filename);
console.log('[UPLOAD] Step 2: Duration detection...');
const duration = await getAudioDuration(req.file.path);
console.log('[UPLOAD] Step 3: Object storage upload...');
const objectPath = await objectStorageService.uploadToPublic(...);
console.log('[UPLOAD] Step 4: Database save...');
const song = await storage.createSong(validated);
console.log('[UPLOAD] Step 5: ACRCloud upload...');
const acrId = await acrCloudUploadService.uploadAudioFile(...);
console.log('[UPLOAD] Step 6: Success!');
```

This will show EXACTLY where it fails.

### 4. Possible Fixes to Try

#### If it's timing out:
```typescript
// In server/index.ts
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Increase timeout
server.setTimeout(300000); // 5 minutes
```

#### If ACRCloud upload is the issue:
Make ACRCloud upload optional/async:
```typescript
// Don't await ACRCloud upload - do it in background
if (acrCloudUploadService.isReady()) {
  acrCloudUploadService.uploadAudioFile(...).catch(err => {
    console.error('Background ACRCloud upload failed:', err);
  });
}
```

#### If cleanup is the issue:
Remove cleanup entirely temporarily:
```typescript
// Comment out cleanup to test
// finally {
//   if (isProduction && tempFilePath) {
//     await unlink(tempFilePath);
//   }
// }
```

---

## Database Schema

```typescript
// shared/schema.ts

export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").default("Eddie Sing & The 31 Days"),
  album: text("album"),
  audioPath: text("audio_path").notNull(), // Points to object storage
  duration: integer("duration").notNull(),
  audioFingerprint: text("audio_fingerprint"), // ACRCloud ID
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  songId: varchar("song_id").references(() => songs.id, { onDelete: "cascade" }),
  segment: integer("segment").notNull(), // 1-4 (60-second intervals)
  category: text("category").notNull(), // "Racism", "Sexism", etc.
  type: text("type").notNull(), // "ACTION", "SHARE", "KNOW", "ALTERNATIVE"
  description: text("description").notNull(),
  points: integer("points").default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").unique().notNull(),
  totalPoints: integer("total_points").default(0),
  completedChallenges: text("completed_challenges").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});
```

---

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Add all variables from "Environment Variables" section above to Replit Secrets

3. **Push Database Schema**
   ```bash
   npm run db:push --force
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Admin Panel**
   - URL: http://localhost:5000/admin
   - Password: `admin123`

6. **Deploy to Production**
   - Ensure all environment variables set in Replit Secrets
   - Click "Deploy" in Replit
   - Verify `/api/debug/storage-config` shows configured: true
   - Test upload in admin panel

---

## Key Dependencies

```json
{
  "@google-cloud/storage": "^7.x",
  "@neondatabase/serverless": "^0.x",
  "acrcloud": "^1.x",
  "drizzle-orm": "^0.x",
  "express": "^4.x",
  "fluent-ffmpeg": "^2.x",
  "multer": "^1.x",
  "react": "^18.x",
  "wouter": "^3.x"
}
```

---

## Admin Credentials

- Password: `admin123`
- No username required
- Protected by session cookie

---

## Object Storage Details

- **Bucket ID:** `replit-objstore-2a2f9427-47bb-41d7-a034-55342a68484f`
- **Public Path:** `/public-objects/songs/[filename]`
- **Upload Directory (Production):** `/tmp/uploads` (writable)
- **Upload Directory (Development):** `client/public/songs` (static serving)

---

## ACRCloud Details

- **Project ID:** 87689
- **Bucket ID:** 28354
- **Host:** identify-us-west-2.acrcloud.com
- **Songs Fingerprinted:** 7 of 11 (4 need bearer token refresh)

---

## Contact Original Developer

If you successfully fix this, please document the solution so others can learn from it.

**Last Known State:** November 8, 2025
**Issue:** Production uploads fail with 500 error
**Priority:** HIGH - blocking production deployment

---

## Good Luck!

The codebase is solid. Development works perfectly. There's just ONE bug in production that needs finding and fixing. You can do this! 🚀
