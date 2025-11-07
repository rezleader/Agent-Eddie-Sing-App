import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { songs } from "../shared/schema";
import { eq } from "drizzle-orm";

async function migrateSongPaths() {
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
    console.log(`✅ Found ${allSongs.length} songs\n`);

    if (allSongs.length === 0) {
      console.log("No songs to migrate!");
      return;
    }

    console.log("🔄 Updating audio paths from /uploads/* to /songs/*...\n");
    
    let updated = 0;
    for (const song of allSongs) {
      if (song.audioPath && song.audioPath.startsWith('/uploads/')) {
        const newPath = song.audioPath.replace('/uploads/', '/songs/');
        
        await db
          .update(songs)
          .set({ audioPath: newPath })
          .where(eq(songs.id, song.id));
        
        console.log(`✅ Updated: "${song.title}"`);
        console.log(`   Old: ${song.audioPath}`);
        console.log(`   New: ${newPath}\n`);
        updated++;
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${updated} of ${allSongs.length} songs`);
    
    if (updated < allSongs.length) {
      console.log(`ℹ️  ${allSongs.length - updated} songs already had correct paths`);
    }

    // Show summary of what files are needed
    console.log("\n📋 SONG FILES NEEDED IN client/public/songs/:");
    console.log("=" .repeat(60));
    const updatedSongs = await db.select().from(songs);
    updatedSongs.forEach((song, index) => {
      const filename = song.audioPath.replace('/songs/', '');
      console.log(`${index + 1}. ${filename}`);
      console.log(`   Title: ${song.title}`);
    });
    console.log("=" .repeat(60));
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateSongPaths();
