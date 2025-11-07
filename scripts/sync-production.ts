import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { songs, challenges } from "../shared/schema";

async function syncToProduction() {
  const devUrl = process.env.DATABASE_URL;
  const prodUrl = process.env.PRODUCTION_DATABASE_URL;

  if (!devUrl || !prodUrl) {
    console.error("❌ Missing DATABASE_URL or PRODUCTION_DATABASE_URL");
    process.exit(1);
  }

  console.log("🔄 Connecting to databases...");
  const devDb = drizzle(neon(devUrl));
  const prodDb = drizzle(neon(prodUrl));

  try {
    console.log("📥 Fetching songs from development...");
    const devSongs = await devDb.select().from(songs);
    console.log(`✅ Found ${devSongs.length} songs`);

    console.log("📥 Fetching challenges from development...");
    const devChallenges = await devDb.select().from(challenges);
    console.log(`✅ Found ${devChallenges.length} challenges`);

    console.log("\n🚀 Copying songs to production...");
    for (const song of devSongs) {
      await prodDb.insert(songs).values(song).onConflictDoNothing();
    }
    console.log(`✅ Copied ${devSongs.length} songs`);

    console.log("🚀 Copying challenges to production...");
    for (const challenge of devChallenges) {
      await prodDb.insert(challenges).values(challenge).onConflictDoNothing();
    }
    console.log(`✅ Copied ${devChallenges.length} challenges`);

    console.log("\n🎉 Sync complete!");
    console.log("🔍 Verifying production data...");
    
    const prodSongs = await prodDb.select().from(songs);
    const prodChallenges = await prodDb.select().from(challenges);
    
    console.log(`✅ Production now has ${prodSongs.length} songs and ${prodChallenges.length} challenges`);
    
  } catch (error) {
    console.error("❌ Error during sync:", error);
    process.exit(1);
  }
}

syncToProduction();
