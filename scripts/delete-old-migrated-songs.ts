import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { songs } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function deleteOldSongs() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...");
  const db = drizzle(neon(dbUrl));

  try {
    console.log("📥 Fetching all songs...");
    const allSongs = await db.select().from(songs);
    console.log(`✅ Found ${allSongs.length} songs total\n`);

    // Old songs have these specific timestamps from the migration
    const oldTimestamps = [
      "1762480917878", // Stand Up
      "1762481273618", // Is This Our America
      "1762481463854", // Please You
      "1762484765224", // Take The Dream
      "1762479857198", // Some Justice Opportunity
      "1762480695131", // Moonlight Summer Dance
      "1762481411854", // Mineola
      "1762481518260", // The Dream
      "1762484379079", // Come On, Come On
      "1762484442938", // She's Taking Me With Her
      "1762484653426", // The Love
    ];

    console.log("🗑️  Identifying old songs to delete...\n");
    
    let deletedCount = 0;
    for (const song of allSongs) {
      // Check if this song's path contains any of the old timestamps
      const isOldSong = oldTimestamps.some(timestamp => 
        song.audioPath.includes(timestamp)
      );
      
      if (isOldSong) {
        await db.delete(songs).where(eq(songs.id, song.id));
        console.log(`🗑️  Deleted: "${song.title}"`);
        console.log(`   Path: ${song.audioPath}\n`);
        deletedCount++;
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Deleted: ${deletedCount} old songs`);
    console.log(`   Remaining: ${allSongs.length - deletedCount} songs\n`);

    // Show remaining songs
    const remainingSongs = await db.select().from(songs);
    console.log("📋 REMAINING SONGS:");
    console.log("=" .repeat(60));
    remainingSongs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   Album: ${song.album || "(none)"}`);
      console.log(`   Path: ${song.audioPath}`);
    });
    console.log("=" .repeat(60));
    
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

deleteOldSongs();
