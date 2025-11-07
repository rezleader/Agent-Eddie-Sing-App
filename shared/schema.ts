import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Songs table - stores audio files and metadata
export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull().default("Eddie Sing & The 31 Days"),
  album: text("album"), // album name
  duration: integer("duration").notNull(), // in seconds
  audioPath: text("audio_path").notNull(), // file path to uploaded audio
  albumArt: text("album_art"), // optional album art URL
  audioFingerprint: text("audio_fingerprint"), // for matching
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Challenge categories
export const challengeCategories = ["love_romance", "racism", "sexism", "homo_transphobia", "threat_ai"] as const;
export type ChallengeCategory = typeof challengeCategories[number];

// Challenge types
export const challengeTypes = ["ACTION", "SHARE", "KNOW", "ALTERNATIVE"] as const;
export type ChallengeType = typeof challengeTypes[number];

// Challenges table - stores all challenge cards
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // love_romance, racism, etc.
  type: text("type").notNull(), // ACTION, SHARE, KNOW, ALTERNATIVE
  title: text("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(), // 1-100
  songId: varchar("song_id").references(() => songs.id, { onDelete: "cascade" }),
  segment: integer("segment").notNull(), // 1, 2, 3, or 4 (minute segments)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User sessions - track user progress and points
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").notNull().unique(),
  totalPoints: integer("total_points").default(0).notNull(),
  completedChallenges: jsonb("completed_challenges").default([]).notNull(), // array of challenge IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
});

// Insert schemas
export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
  audioFingerprint: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
}).extend({
  category: z.enum(challengeCategories),
  type: z.enum(challengeTypes),
  points: z.number().min(1).max(100),
  segment: z.number().min(1).max(4),
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

// Types
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

// Helper types for frontend
export interface SongWithChallenges extends Song {
  challenges?: Challenge[];
}

export interface ChallengeWithSong extends Challenge {
  song?: Song;
}

// Category display names
export const categoryDisplayNames: Record<ChallengeCategory, string> = {
  love_romance: "Love & Romance",
  racism: "Racism",
  sexism: "Sexism",
  homo_transphobia: "Homo/Transphobia",
  threat_ai: "The Threat of A.I.",
};

// Social media platforms
export const socialPlatforms = ["facebook", "instagram", "snapchat", "tiktok"] as const;
export type SocialPlatform = typeof socialPlatforms[number];
