#!/usr/bin/env tsx

import { storage } from "../server/storage";
import { acrCloudUploadService } from "../server/acrcloud-upload";
import path from "path";

async function uploadAllSongsToACRCloud() {
  console.log("🎵 Uploading all songs to ACRCloud...\n");

  if (!acrCloudUploadService.isReady()) {
    console.error("❌ ACRCloud upload service not configured!");
    console.error("   Please set ACRCLOUD_BUCKET_ID and ACRCLOUD_BEARER_TOKEN secrets");
    process.exit(1);
  }

  const songs = await storage.getSongs();
  
  if (songs.length === 0) {
    console.log("No songs found in database.");
    return;
  }

  console.log(`Found ${songs.length} songs to upload\n`);

  let successCount = 0;
  let failCount = 0;

  for (const song of songs) {
    console.log(`\n📤 Uploading: "${song.title}"`);
    console.log(`   Artist: ${song.artist}`);
    console.log(`   Album: ${song.album || 'N/A'}`);
    
    // Convert audioPath from /uploads/filename to actual file path
    const filePath = path.join(process.cwd(), song.audioPath.replace(/^\//, ''));
    
    const acrId = await acrCloudUploadService.uploadAudioFile(
      filePath,
      song.title,
      song.artist,
      song.album || undefined
    );

    if (acrId) {
      console.log(`   ✅ Success! ACR ID: ${acrId}`);
      successCount++;
    } else {
      console.log(`   ❌ Failed to upload`);
      failCount++;
    }
  }

  console.log(`\n\n📊 Upload Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${songs.length}`);

  if (successCount > 0) {
    console.log(`\n🎉 All done! Songs are now in your ACRCloud bucket.`);
    console.log(`   Wait a few minutes for ACRCloud to process them (status: "Ready")`);
    console.log(`   Then test recognition with your app!`);
  }
}

uploadAllSongsToACRCloud().catch(console.error);
