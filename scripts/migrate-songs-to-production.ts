import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { songs } from "../shared/schema";

// This script migrates songs from dev database to production database
// Both databases use the same object storage bucket, so files are already accessible

async function migrateSongs() {
  const devDatabaseUrl = process.env.DATABASE_URL;
  
  if (!devDatabaseUrl) {
    throw new Error("DATABASE_URL not set");
  }
  
  const prodDatabaseUrl = process.env.PROD_DATABASE_URL || devDatabaseUrl;

  console.log("🔄 Starting song migration from dev to production...\n");

  // Connect to development database
  const devSql = neon(devDatabaseUrl);
  const devDb = drizzle(devSql);

  // Connect to production database
  const prodSql = neon(prodDatabaseUrl);
  const prodDb = drizzle(prodSql);

  try {
    // Fetch all songs from development
    const devSongs = await devDb.select().from(songs);
    console.log(`📀 Found ${devSongs.length} songs in development database\n`);

    if (devSongs.length === 0) {
      console.log("⚠️  No songs to migrate");
      return;
    }

    // Check what's already in production
    const prodSongs = await prodDb.select().from(songs);
    console.log(`📀 Production currently has ${prodSongs.length} songs\n`);

    // Insert songs into production (skip duplicates by title)
    const existingTitles = new Set(prodSongs.map(s => s.title));
    let migratedCount = 0;
    let skippedCount = 0;

    for (const song of devSongs) {
      if (existingTitles.has(song.title)) {
        console.log(`⏭️  Skipping "${song.title}" (already exists)`);
        skippedCount++;
        continue;
      }

      try {
        await prodDb.insert(songs).values({
          title: song.title,
          artist: song.artist,
          album: song.album,
          spotifyLink: song.spotifyLink,
          duration: song.duration,
          audioPath: song.audioPath, // Same object storage bucket
          albumArt: song.albumArt,
          audioFingerprint: song.audioFingerprint,
        });
        console.log(`✅ Migrated "${song.title}" (${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')})`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Failed to migrate "${song.title}":`, error);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Migrated: ${migratedCount} songs`);
    console.log(`   ⏭️  Skipped: ${skippedCount} songs (duplicates)`);
    console.log(`   📀 Total in production: ${prodSongs.length + migratedCount} songs`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateSongs()
  .then(() => {
    console.log("\n✨ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
