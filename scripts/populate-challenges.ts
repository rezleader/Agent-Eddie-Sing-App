import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { songs, challenges } from "../shared/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = neon(databaseUrl);
const db = drizzle(client);

// Challenge data organized by category and type
const challengeData = {
  // Love & Romance challenges
  love_romance: {
    ACTION: [
      "Create a 15 second TikTok video explaining the importance of consent in relationships and post it with the hashtag #respectconsent.",
      "Create a TikTok video explaining the importance of consent and how to ask for it.",
      "Create a TikTok video about healthy relationship boundaries and post it with #healthylove.",
      "Make a video sharing what love means to you and post with #loveislove.",
    ],
    SHARE: [
      "Share a TikTok video about a positive love story from your community with #lovestories.",
      "Share a video about relationship advice that helped you with #relationshipgoals.",
      "Share a TikTok video of you sharing your story of surviving domestic violence and encourage your followers to reach out for help if they are in a similar situation.",
      "Share a video about self-love and acceptance with #loveyourself.",
    ],
    KNOW: [
      "Answer a multiple choice question about healthy relationship communication on TikTok.",
      "Create a quiz about consent and healthy relationships on TikTok.",
      "Answer questions about recognizing red flags in relationships.",
      "Create a true or false quiz about love and respect in relationships.",
    ],
    ALTERNATIVE: [
      "Create a dance TikTok video to the song 'Please You' from the American Split album and include a message about self love and acceptance.",
      "Create a TikTok lip sync challenge featuring a song from the American Split album about love.",
      "Create a lip syncing TikTok video to a romantic song and include a message about authentic love.",
      "Create a TikTok dance trend that promotes self-love and body positivity.",
    ],
  },
  
  // Racism challenges
  racism: {
    ACTION: [
      "Make a TikTok video advocating for the Black Lives Matter movement and share it on your profile with the hashtag #blacklivesmatter.",
      "Create a TikTok video about combating racism in your community and post with #antiracism.",
      "Make a video explaining systemic racism and post with #educate.",
      "Create a video about allyship and how to support people of color.",
    ],
    SHARE: [
      "Create a TikTok video featuring a lyric from the song 'Some Justice Opportunity' about Michael Brown and share it with the hashtag #justiceforMichaelBrown.",
      "Share a TikTok video made by a person of color on your own TikTok page with the hashtag #blacklivesmatter.",
      "Share a TikTok video of you performing a spoken word piece about racial justice and tag it with the hashtag #BlackLivesMatter.",
      "Share a TikTok video that speaks to the issue of racism, and include a message about how we can combat racism in our society.",
    ],
    KNOW: [
      "Answer a multiple choice question about the history of the Civil Rights movement in the United States on TikTok and use the hashtag #equalityforall.",
      "Create a quiz on TikTok about the Civil Rights movement.",
      "Answer questions about systemic racism and its impact.",
      "Create a multiple choice quiz about racial justice history.",
    ],
    ALTERNATIVE: [
      "Create a TikTok dance to the song 'This My America' and share it on your profile with the hashtag #thismyamerica.",
      "Create a lip syncing TikTok video to the song 'This My America' from the American Split album and include a message about standing up for what you believe in.",
      "Create a TikTok dance video to one of the songs from American Split about racial justice.",
      "Create a cover of a song from American Split that addresses racism.",
    ],
  },
  
  // Sexism challenges
  sexism: {
    ACTION: [
      "Make a TikTok video advocating for the protection of women's reproductive rights and share it on your profile with the hashtag #prochoice.",
      "Create a video about gender equality and post with #equalrights.",
      "Make a TikTok about supporting women in leadership with #womenlead.",
      "Create a video explaining the gender pay gap and post with #equalpay.",
    ],
    SHARE: [
      "Share a TikTok video about an experience you or someone you know has had with sexism.",
      "Share a video highlighting women's achievements with #womenshistory.",
      "Share a story about overcoming gender discrimination.",
      "Share a TikTok celebrating powerful women in your life with #strongwomen.",
    ],
    KNOW: [
      "Answer a multiple choice question about the history of the women's suffrage movement in the United States on TikTok and use the hashtag #feminismmatters.",
      "Create a quiz on TikTok about the history of the fight for women's rights in the United States.",
      "Create a multiple choice quiz about the women's suffrage movement on TikTok.",
      "Answer questions about gender equality and women's rights history.",
    ],
    ALTERNATIVE: [
      "Create a TikTok lip sync to the song 'Please You' and share it on your profile with the hashtag #pleasureyou.",
      "Create a TikTok lip sync video featuring one of the songs from American Split about women's empowerment.",
      "Create a dance to 'Stand Up' and share with #standup.",
      "Create a comedy skit featuring a song from American Split about gender equality.",
    ],
  },
  
  // Homo/Transphobia challenges
  homo_transphobia: {
    ACTION: [
      "Share a TikTok video about how to support LGBTQ+ rights and equality.",
      "Create a video about LGBTQ+ allyship and post with #pride.",
      "Make a TikTok explaining transgender rights and post with #transrightsarehumanrights.",
      "Create a video about supporting LGBTQ+ youth with #loveislove.",
    ],
    SHARE: [
      "Share a TikTok video made by an LGBTQ+ creator on your own TikTok page with the hashtag #loveislove.",
      "Share a TikTok video about an experience you or someone you know has had with transphobia.",
      "Share a video celebrating LGBTQ+ pride with #pridemonth.",
      "Share a story from an LGBTQ+ person in your community.",
    ],
    KNOW: [
      "Create a true or false quiz on TikTok about the history of the LGBTQ+ rights movement.",
      "Create a quiz on TikTok about the history of the fight for LGBTQ+ rights in the United States.",
      "Answer questions about LGBTQ+ history and rights.",
      "Create a multiple choice quiz about marriage equality.",
    ],
    ALTERNATIVE: [
      "Create a TikTok dance celebrating pride and diversity.",
      "Create a lip sync to a song supporting LGBTQ+ rights.",
      "Create a comedy skit TikTok video to the song 'Come On, Come On' from the American Split album promoting acceptance.",
      "Create a TikTok challenge supporting LGBTQ+ equality.",
    ],
  },
  
  // Threat of A.I. challenges
  threat_ai: {
    ACTION: [
      "Share a TikTok video about the dangers of technology and how to protect your privacy online.",
      "Create a TikTok video about online safety and post with #staysafeonline.",
      "Create a TikTok video explaining the dangers of online harassment and encourage your followers to report it when they see it.",
      "Make a video about AI ethics and post with #techethics.",
    ],
    SHARE: [
      "Share a TikTok video about an experience you or someone you know has had with technology changing their life.",
      "Share a video about protecting privacy in the digital age.",
      "Share a TikTok video of you sharing your story of overcoming online harassment and encourage your followers to speak out against it.",
      "Share a story about the impact of social media on mental health.",
    ],
    KNOW: [
      "Create a multiple choice quiz on TikTok about internet safety and privacy.",
      "Answer questions about online privacy and data protection.",
      "Create a quiz about AI and its societal impact.",
      "Answer a multiple choice question about cybersecurity.",
    ],
    ALTERNATIVE: [
      "Create a TikTok about balancing technology use with real life.",
      "Create a comedy skit about social media culture.",
      "Make a parody video about screen time with #unplug.",
      "Create a creative video about digital wellbeing.",
    ],
  },
};

async function populateChallenges() {
  try {
    console.log("Fetching songs...");
    const allSongs = await db.select().from(songs);
    
    if (allSongs.length === 0) {
      console.log("No songs found. Please upload songs first.");
      return;
    }

    console.log(`Found ${allSongs.length} songs`);

    // For each song
    for (const song of allSongs) {
      console.log(`\nPopulating challenges for: ${song.title}`);
      
      // For each segment (1-4, representing each minute)
      for (let segment = 1; segment <= 4; segment++) {
        console.log(`  Segment ${segment}:`);
        
        // For each category
        for (const [categoryKey, categoryData] of Object.entries(challengeData)) {
          // For each type within this category
          for (const [type, descriptions] of Object.entries(categoryData)) {
            // Pick a description for this segment (cycle through available descriptions)
            const descIndex = (segment - 1) % descriptions.length;
            const description = descriptions[descIndex];
            
            // Determine points based on type
            let points = 30;
            if (type === "ACTION") points = 50;
            if (type === "SHARE") points = 40;
            if (type === "KNOW") points = 30;
            if (type === "ALTERNATIVE") points = 70;
            
            const challengeTitle = `${song.title} - ${categoryKey.replace('_', ' ')} - ${type}`;
            
            await db.insert(challenges).values({
              category: categoryKey,
              type: type,
              title: challengeTitle,
              description: description,
              points: points,
              songId: song.id,
              segment: segment,
            });
            
            console.log(`    ✓ ${categoryKey} - ${type}`);
          }
        }
      }
    }

    console.log("\n✅ All challenges populated successfully!");
    
    // Show summary
    const totalChallenges = await db.select().from(challenges);
    console.log(`\nTotal challenges in database: ${totalChallenges.length}`);
    
  } catch (error) {
    console.error("Error populating challenges:", error);
    process.exit(1);
  }
}

populateChallenges();
