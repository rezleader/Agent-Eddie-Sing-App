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
  spotifyLink: text("spotify_link"), // link to song on Spotify
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
  organization: text("organization"), // Related organization/resource
  organizationUrl: text("organization_url"), // Link to organization
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User sessions - track user progress and points
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").notNull().unique(),
  totalPoints: integer("total_points").default(0).notNull(),
  completedChallenges: jsonb("completed_challenges").default([]).notNull(), // array of challenge IDs
  currentScanSongId: varchar("current_scan_song_id"), // track current scan session
  currentScanSegment: integer("current_scan_segment"), // track detected segment
  lockedChallengeType: text("locked_challenge_type"), // lock to one type per scan
  lastScanAt: timestamp("last_scan_at"), // timestamp of last scan to detect new scans
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
});

// Media types
export const mediaTypes = ["photo", "video"] as const;
export type MediaType = typeof mediaTypes[number];

// User media - stores user-uploaded photos and videos
export const userMedia = pgTable("user_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").notNull(), // link to user session
  challengeId: varchar("challenge_id").references(() => challenges.id, { onDelete: "cascade" }),
  mediaType: text("media_type").notNull(), // 'photo' or 'video'
  filePath: text("file_path").notNull(), // path to uploaded file in object storage
  fileSize: integer("file_size"), // in bytes
  mimeType: text("mime_type"), // e.g., image/jpeg, video/mp4
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const insertUserMediaSchema = createInsertSchema(userMedia).omit({
  id: true,
  createdAt: true,
}).extend({
  mediaType: z.enum(mediaTypes),
});

// Types
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

export type InsertUserMedia = z.infer<typeof insertUserMediaSchema>;
export type UserMedia = typeof userMedia.$inferSelect;

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
