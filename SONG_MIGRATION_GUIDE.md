# Song Migration Guide - Permanent Storage Setup

## ✅ What Changed

Your songs are now stored in `client/public/songs/` which means they:
- **Survive all republishes!** 🎉
- Deploy with your code
- Work in both dev and production
- No more lost files!

## 📋 Steps to Complete Migration

### Step 1: Run the Migration Script

This updates your database to point to the new paths:

```bash
npx tsx scripts/migrate-to-public-songs.ts
```

This will show you a list of all the filenames you need.

### Step 2: Upload Your Song Files

You have 11 songs that need to be placed in `client/public/songs/`:

**Where to get the original files:**
- You should have the original MP3/WAV files you uploaded earlier
- They should be on your computer somewhere

**How to upload to Replit:**
1. In Replit, navigate to `client/public/songs/` folder
2. Click the "Upload file" button (or drag and drop)
3. Upload all 11 original audio files
4. Make sure the filenames match what the migration script shows

**IMPORTANT:** The filenames must match EXACTLY what's in the database. The migration script will show you the exact filenames needed.

### Step 3: Verify Everything Works

1. Restart the app
2. Go to admin panel → Songs
3. All 11 songs should be listed
4. Try playing one - it should work!
5. Test the scanner - recognition should work perfectly

### Step 4: Republish to Production

Once dev works:
1. Click "Update deployment" in Replit
2. Wait 2-3 minutes for build
3. Your production app will have all songs automatically!
4. They'll survive ALL future republishes! 🎉

## 🎯 Benefits

- ✅ Files stored in Git (versioned, backed up)
- ✅ Automatic deployment (no manual uploads)
- ✅ Works in dev and production
- ✅ Survives all republishes
- ✅ No external dependencies
- ✅ Free (no storage costs)

## ❓ Troubleshooting

**Q: Where do I find my original song files?**
A: Check your Downloads folder, or wherever you initially saved Eddie Sing's songs before uploading them to the app.

**Q: What if filenames don't match?**
A: You can either:
1. Rename your files to match what the database expects
2. OR re-upload via admin panel (generates new fingerprints automatically)

**Q: Do I need to re-fingerprint songs?**
A: No! ACRCloud already has the fingerprints. Just make sure the files match the original audio you uploaded.
