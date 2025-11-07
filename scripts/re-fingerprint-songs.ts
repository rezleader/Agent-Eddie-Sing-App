import { songs } from '../shared/schema';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { acrCloudUploadService } from '../server/acrcloud-upload';

// Create database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}
const client = neon(databaseUrl);
const db = drizzle(client);

/**
 * Migration script to re-fingerprint all existing songs
 * 
 * This script:
 * 1. Fetches all songs from the database
 * 2. For each song with an audio file in /uploads
 * 3. Generates a fingerprint using ACRCloud's tool
 * 4. Uploads the fingerprint to ACRCloud bucket
 * 5. Updates the song record with the new acrid
 * 
 * This fixes the issue where songs were uploaded as audio (not fingerprint)
 * and therefore couldn't be recognized from compressed sources like SoundCloud.
 */

async function refingerprintAllSongs() {
  console.log('='.repeat(80));
  console.log('RE-FINGERPRINTING ALL SONGS');
  console.log('='.repeat(80));
  console.log('');

  // Check if ACRCloud upload service is ready
  if (!acrCloudUploadService.isReady()) {
    console.error('❌ ACRCloud Upload service not ready!');
    console.error('Please set:');
    console.error('  - ACRCLOUD_BUCKET_ID (should be 28342)');
    console.error('  - ACRCLOUD_BEARER_TOKEN (from ACRCloud Console)');
    console.error('');
    console.error('See SETUP_SECRETS.md for instructions.');
    process.exit(1);
  }

  console.log('✅ ACRCloud Upload service is ready');
  console.log('');

  // Fetch all songs from database
  console.log('Fetching songs from database...');
  const allSongs = await db.select().from(songs);
  
  console.log(`Found ${allSongs.length} song(s) in database`);
  console.log('');

  if (allSongs.length === 0) {
    console.log('No songs found. Nothing to do.');
    return;
  }

  // Process each song
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < allSongs.length; i++) {
    const song = allSongs[i];
    const songNum = i + 1;
    
    console.log('-'.repeat(80));
    console.log(`[${songNum}/${allSongs.length}] Processing: "${song.title}"`);
    console.log(`   Artist: ${song.artist}`);
    console.log(`   Album: ${song.album || 'N/A'}`);
    console.log(`   Audio Path: ${song.audioPath}`);

    // Check if audio file exists
    const audioFilePath = path.join(process.cwd(), song.audioPath);
    if (!fs.existsSync(audioFilePath)) {
      console.error(`   ❌ Audio file not found: ${audioFilePath}`);
      skippedCount++;
      continue;
    }

    try {
      // Upload as fingerprint to ACRCloud
      console.log(`   → Generating fingerprint and uploading to ACRCloud...`);
      const acrid = await acrCloudUploadService.uploadAudioFile(
        audioFilePath,
        song.title,
        song.artist,
        song.id,
        song.album ?? null
      );

      if (acrid) {
        console.log(`   ✅ Success! ACRID: ${acrid}`);
        
        // Update database with new fingerprint ID
        await db.update(songs)
          .set({ audioFingerprint: acrid })
          .where(eq(songs.id, song.id));
        
        console.log(`   ✅ Database updated with new ACRID`);
        successCount++;
      } else {
        console.error(`   ❌ Upload failed (no ACRID returned)`);
        failCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
      failCount++;
    }

    console.log('');
  }

  // Summary
  console.log('='.repeat(80));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`📊 Total:   ${allSongs.length}`);
  console.log('');

  if (successCount > 0) {
    console.log('🎉 Your songs now have robust fingerprints that work with compressed audio!');
    console.log('You can now test recognition from SoundCloud, Spotify, etc.');
  }

  if (failCount > 0) {
    console.log('⚠️  Some songs failed. Check the logs above for details.');
  }
}

// Run the migration
refingerprintAllSongs()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
