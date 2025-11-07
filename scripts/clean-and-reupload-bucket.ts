import fetch from 'node-fetch';
import { songs } from '../shared/schema';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { acrCloudUploadService } from '../server/acrcloud-upload';

// Create database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}
const client = neon(databaseUrl);
const db = drizzle(client);

const BUCKET_ID = '28342';
const BEARER_TOKEN = process.env.ACRCLOUD_BEARER_TOKEN!;
const BASE_URL = 'https://console-api.acrcloud.com';

async function listBucketFiles() {
  console.log(`\n📋 Listing all files in bucket ${BUCKET_ID}...`);
  
  const response = await fetch(`${BASE_URL}/api/buckets/${BUCKET_ID}/files`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `token ${BEARER_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to list files: ${response.statusText}`);
  }

  const data = await response.json() as any;
  return data.data || [];
}

async function deleteAllFiles(fileIds: number[]) {
  if (fileIds.length === 0) {
    console.log('✅ No files to delete');
    return;
  }

  console.log(`\n🗑️  Deleting ${fileIds.length} files from bucket ${BUCKET_ID}...`);
  const idsString = fileIds.join(',');
  
  const response = await fetch(`${BASE_URL}/api/buckets/${BUCKET_ID}/files/${idsString}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': `token ${BEARER_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to delete files: ${response.statusText}`);
  }

  console.log(`✅ Successfully deleted ${fileIds.length} files`);
}

async function reuploadAllSongs() {
  console.log('\n📤 Re-uploading all songs from database...\n');
  
  const allSongs = await db.select().from(songs);
  console.log(`Found ${allSongs.length} songs in database\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allSongs.length; i++) {
    const song = allSongs[i];
    console.log(`[${i + 1}/${allSongs.length}] Processing: "${song.title}"`);
    
    try {
      // Fix path: /uploads/file.wav -> uploads/file.wav (relative to cwd)
      const audioPath = song.audioPath.startsWith('/') 
        ? song.audioPath.substring(1) 
        : song.audioPath;
      
      const acrid = await acrCloudUploadService.uploadAudioFile(
        audioPath,
        song.title,
        song.artist,
        song.id,
        song.album
      );
      
      // Update song with new ACRID
      await db.update(songs)
        .set({ audioFingerprint: acrid })
        .where(eq(songs.id, song.id));
      
      console.log(`   ✅ Uploaded with ACRID: ${acrid}\n`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed:`, error);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('CLEANUP AND RE-UPLOAD COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failCount}`);
  console.log(`📊 Total:   ${allSongs.length}`);
}

async function main() {
  console.log('='.repeat(80));
  console.log('ACRCLOUD BUCKET CLEANUP & RE-UPLOAD');
  console.log('='.repeat(80));

  try {
    // Step 1: List all files
    const files = await listBucketFiles();
    console.log(`📊 Found ${files.length} files in bucket`);
    
    if (files.length > 0) {
      console.log('\nFiles to delete:');
      files.forEach((file: any) => {
        console.log(`  - ID ${file.id}: ${file.title}`);
      });
    }

    // Step 2: Delete all files
    const fileIds = files.map((f: any) => f.id);
    await deleteAllFiles(fileIds);

    // Step 3: Re-upload from database
    await reuploadAllSongs();

    console.log('\n🎉 All done! Wait 2-3 minutes for indexing, then test recognition.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
