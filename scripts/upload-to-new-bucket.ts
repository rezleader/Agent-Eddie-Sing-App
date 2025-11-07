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

async function uploadAllSongs() {
  console.log('='.repeat(80));
  console.log('UPLOADING ALL SONGS TO NEW BUCKET');
  console.log('='.repeat(80));
  console.log('');

  const allSongs = await db.select().from(songs);
  console.log(`📊 Found ${allSongs.length} songs in database\n`);

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
      
      if (acrid) {
        // Update song with new ACRID
        await db.update(songs)
          .set({ audioFingerprint: acrid })
          .where(eq(songs.id, song.id));
        
        console.log(`   ✅ Uploaded with ACRID: ${acrid}\n`);
        successCount++;
      } else {
        console.error(`   ❌ Upload returned null\n`);
        failCount++;
      }
    } catch (error) {
      console.error(`   ❌ Failed:`, error);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('UPLOAD COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failCount}`);
  console.log(`📊 Total:   ${allSongs.length}`);
  console.log('');
  console.log('🎯 Next: Wait 2-3 minutes for ACRCloud indexing, then test recognition!');
  
  process.exit(failCount > 0 ? 1 : 0);
}

uploadAllSongs();
