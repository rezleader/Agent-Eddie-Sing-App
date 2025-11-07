import { songs } from '../shared/schema';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { acrCloudUploadService } from '../server/acrcloud-upload';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}
const client = neon(databaseUrl);
const db = drizzle(client);

async function testSingleUpload() {
  console.log('🧪 Testing single song upload...\n');

  // Get first song
  const allSongs = await db.select().from(songs).limit(1);
  
  if (allSongs.length === 0) {
    console.error('❌ No songs found in database');
    process.exit(1);
  }

  const song = allSongs[0];
  console.log(`Testing with: "${song.title}"`);
  console.log(`Audio path: ${song.audioPath}\n`);

  try {
    // Fix path: /uploads/file.wav -> uploads/file.wav
    const audioPath = song.audioPath.startsWith('/') 
      ? song.audioPath.substring(1) 
      : song.audioPath;
    
    console.log(`Resolved path: ${audioPath}\n`);
    
    const acrid = await acrCloudUploadService.uploadAudioFile(
      audioPath,
      song.title,
      song.artist,
      song.id,
      song.album
    );
    
    if (acrid) {
      // Update database
      await db.update(songs)
        .set({ audioFingerprint: acrid })
        .where(eq(songs.id, song.id));
      
      console.log(`\n✅ SUCCESS! ACRID: ${acrid}`);
      console.log(`\n🎉 Upload works! Ready to upload all 11 songs.`);
      process.exit(0);
    } else {
      console.error('\n❌ Upload returned null');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  }
}

testSingleUpload();
