# SoundCloud Recognition Setup Instructions

## Problem
ACRCloud can't recognize songs from SoundCloud streams because the streaming version has different audio fingerprints than the downloadable version.

## Solution
We need to capture what SoundCloud **actually streams** (not what the download button gives you) and upload those files to ACRCloud.

---

## Step-by-Step Instructions

### Step 1: Get Your SoundCloud URLs

Get the URL for each of your 11 songs. They should look like:
```
https://soundcloud.com/your-username/song-title
```

### Step 2: Edit the Download Script

1. Open the file: `download-soundcloud-streams.sh`
2. Replace the URLs in the script with your actual SoundCloud URLs:

```bash
declare -a SONGS=(
  "Song1 - Some Justice Opportunity|https://soundcloud.com/YOUR_USERNAME/some-justice-opportunity"
  "Song2 - Moonlight Summer Dance|https://soundcloud.com/YOUR_USERNAME/moonlight-summer-dance"
  # ... etc for all 11 songs
)
```

### Step 3: Run the Download Script

In the Replit Shell, run:
```bash
bash download-soundcloud-streams.sh
```

This will download all 11 songs in the exact format that SoundCloud streams them.

**Files will be saved to:** `./soundcloud-streams/`

### Step 4: Upload to ACRCloud

1. Go to: https://console.acrcloud.com
2. Navigate to your project (ID: 87666)
3. Open your bucket: "American Split AI" (ID: 28342)
4. **Delete the old WAV files** (or keep them, doesn't matter)
5. **Upload all 11 files** from `./soundcloud-streams/`
6. Fill out metadata for each:
   - **Title**: Song title (e.g., "Some Justice Opportunity")
   - **Artist**: Eddie Sing & The 31 Days
   - **Album**: American Split AI
   - **Song ID**: Song1, Song2, Song3, etc. (important for matching!)
7. Wait for processing - status should show "Ready"

### Step 5: Test!

1. Play one of your songs on SoundCloud
2. Open your American Split AI app
3. Click the microphone button
4. Let it record for 5-10 seconds
5. Check if it recognizes the song!

---

## What Got Fixed

### Backend Improvements
✅ **Audio conversion added**: WebM recordings are now converted to PCM WAV (16-bit, 44.1kHz, mono) before sending to ACRCloud
✅ **Better fingerprint matching**: Removes double-lossy encoding that was causing mismatches
✅ **ACRCloud requirements met**: Proper audio format as per their documentation

### What You Need to Do
📥 **Download streaming versions**: Use the provided script to get the actual SoundCloud stream files
📤 **Upload to ACRCloud**: Replace/add the files in your custom bucket

---

## Troubleshooting

**Script fails to download:**
- Make sure yt-dlp is working: `yt-dlp --version`
- Check that your SoundCloud URLs are correct
- Try one song first before doing all 11

**ACRCloud still doesn't recognize:**
- Make sure files show "Ready" status in ACRCloud
- Verify the Song ID matches (Song1-Song11)
- Wait a few minutes after upload for indexing
- Contact ACRCloud support if issues persist

**Need help?**
Check the logs in the Replit console for detailed error messages.

---

## Expected Result

Once complete:
- ✅ Songs play on SoundCloud
- ✅ App records audio via microphone
- ✅ ACRCloud recognizes the song (100% confidence)
- ✅ Correct segment detected (based on timestamp)
- ✅ Challenges appear for that segment

This should work because the fingerprints will finally match! 🎵
