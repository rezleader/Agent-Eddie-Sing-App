import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { songs } from "../shared/schema";
import { eq } from "drizzle-orm";
import { ObjectStorageService } from "../server/objectStorage";
import { readdirSync } from "fs";
import path from "path";

async function migrateSongsToObjectStorage() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...");
  const db = drizzle(neon(dbUrl));
  const objectStorage = new ObjectStorageService();

  try {
    // Get all WAV files from client/public/songs
    const songsDir = path.join(process.cwd(), "client", "public", "songs");
    const wavFiles = readdirSync(songsDir).filter(f => f.endsWith('.wav'));
    
    console.log(`📁 Found ${wavFiles.length} WAV files in ${songsDir}\n`);

    // Get all songs from database
    const allSongs = await db.select().from(songs);
    console.log(`📥 Found ${allSongs.length} songs in database\n`);

    let migratedCount = 0;
    
    for (const wavFile of wavFiles) {
      const localFilePath = path.join(songsDir, wavFile);
      
      // Find matching song in database
      const song = allSongs.find(s => 
        s.audioPath.includes(wavFile) || s.audioPath.endsWith(wavFile)
      );

      if (!song) {
        console.log(`⚠️  Skipping ${wavFile} - no matching database entry`);
        continue;
      }

      console.log(`🔄 Migrating: "${song.title}"`);
      console.log(`   File: ${wavFile}`);

      try {
        // Upload to Object Storage
        const objectPath = await objectStorage.uploadToPublic(
          localFilePath,
          `songs/${wavFile}`,
          "audio/wav"
        );
        
        console.log(`   ✅ Uploaded to: ${objectPath}`);

        // Update database
        await db
          .update(songs)
          .set({ audioPath: objectPath })
          .where(eq(songs.id, song.id));
        
        console.log(`   ✅ Database updated\n`);
        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Failed to migrate:`, error);
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`   Migrated: ${migratedCount} of ${wavFiles.length} songs`);
    
    // Show final status
    const updatedSongs = await db.select().from(songs);
    console.log("\n📋 FINAL SONG STATUS:");
    console.log("=" .repeat(60));
    updatedSongs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   Path: ${song.audioPath}`);
      console.log(`   Storage: ${song.audioPath.startsWith('/public-objects/') ? '✅ Object Storage' : '❌ Local'}`);
    });
    console.log("=" .repeat(60));
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateSongsToObjectStorage();
