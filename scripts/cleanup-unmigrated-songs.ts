import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { songs } from "../shared/schema";
import { eq } from "drizzle-orm";

async function cleanupUnmigratedSongs() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...\n");
  const db = drizzle(neon(dbUrl));

  try {
    const allSongs = await db.select().from(songs);
    
    // Find songs still on local paths (not migrated)
    const unmigratedSongs = allSongs.filter(s => 
      s.audioPath.startsWith('/songs/') && !s.audioPath.startsWith('/public-objects/')
    );
    
    const migratedSongs = allSongs.filter(s => 
      s.audioPath.startsWith('/public-objects/')
    );

    console.log("📊 MIGRATION STATUS:");
    console.log("=" .repeat(60));
    console.log(`✅ Migrated to Object Storage: ${migratedSongs.length} songs`);
    console.log(`❌ Still on local paths: ${unmigratedSongs.length} songs`);
    console.log("=" .repeat(60));

    if (unmigratedSongs.length > 0) {
      console.log("\n🗑️  UNMIGRATED SONGS (need to be deleted & re-uploaded):\n");
      unmigratedSongs.forEach((song, index) => {
        console.log(`${index + 1}. ${song.title}`);
        console.log(`   ID: ${song.id}`);
        console.log(`   Path: ${song.audioPath}\n`);
      });

      console.log("📝 NEXT STEPS:");
      console.log("1. Delete these " + unmigratedSongs.length + " songs from admin panel");
      console.log("2. Re-upload them via admin panel");
      console.log("3. New uploads will automatically use Object Storage ✅");
      console.log("\nOR run this script with --delete flag to auto-delete them:");
      console.log("npx tsx scripts/cleanup-unmigrated-songs.ts --delete");
    }

    if (process.argv.includes('--delete')) {
      console.log("\n🗑️  DELETING unmigrated songs...\n");
      for (const song of unmigratedSongs) {
        await db.delete(songs).where(eq(songs.id, song.id));
        console.log(`✅ Deleted: ${song.title}`);
      }
      console.log(`\n✅ Deleted ${unmigratedSongs.length} songs`);
      console.log("👉 Now re-upload them via admin panel!");
    }

    console.log("\n📋 MIGRATED SONGS (ready for production):\n");
    migratedSongs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title}`);
    });
    console.log("=" .repeat(60));
    
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
}

cleanupUnmigratedSongs();
