import { type Song, type InsertSong, type Challenge, type InsertChallenge, type UserSession, type InsertUserSession, songs, challenges, userSessions } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

export interface IStorage {
  // Songs
  getSongs(): Promise<Song[]>;
  getSong(id: string): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: string, song: Partial<InsertSong>): Promise<Song | undefined>;
  deleteSong(id: string): Promise<void>;
  
  // Challenges
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  getChallengesBySong(songId: string): Promise<Challenge[]>;
  getChallengesBySegment(songId: string, segment: number): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  deleteChallenge(id: string): Promise<void>;
  
  // User Sessions
  getUserSession(sessionToken: string): Promise<UserSession | undefined>;
  getAllUserSessions(): Promise<UserSession[]>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSessionPoints(sessionToken: string, points: number): Promise<UserSession | undefined>;
  addCompletedChallenge(sessionToken: string, challengeId: string): Promise<UserSession | undefined>;
}

export class PostgresStorage implements IStorage {
  private db;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    // Debug logging for production
    console.log('[PostgresStorage] Connecting to database:', databaseUrl.substring(0, 50) + '...');
    const client = neon(databaseUrl);
    this.db = drizzle(client);
  }

  // Songs
  async getSongs(): Promise<Song[]> {
    return await this.db.select().from(songs);
  }

  async getSong(id: string): Promise<Song | undefined> {
    const result = await this.db.select().from(songs).where(eq(songs.id, id));
    return result[0];
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const result = await this.db
      .insert(songs)
      .values(insertSong)
      .returning();
    return result[0];
  }

  async updateSong(id: string, updateData: Partial<InsertSong>): Promise<Song | undefined> {
    const result = await this.db
      .update(songs)
      .set(updateData)
      .where(eq(songs.id, id))
      .returning();
    return result[0];
  }

  async deleteSong(id: string): Promise<void> {
    await this.db.delete(songs).where(eq(songs.id, id));
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return await this.db.select().from(challenges);
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const result = await this.db.select().from(challenges).where(eq(challenges.id, id));
    return result[0];
  }

  async getChallengesBySong(songId: string): Promise<Challenge[]> {
    return await this.db
      .select()
      .from(challenges)
      .where(eq(challenges.songId, songId));
  }

  async getChallengesBySegment(songId: string, segment: number): Promise<Challenge[]> {
    return await this.db
      .select()
      .from(challenges)
      .where(sql`${challenges.songId} = ${songId} AND ${challenges.segment} = ${segment}`);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const result = await this.db
      .insert(challenges)
      .values(insertChallenge)
      .returning();
    return result[0];
  }

  async deleteChallenge(id: string): Promise<void> {
    await this.db.delete(challenges).where(eq(challenges.id, id));
  }

  // User Sessions
  async getUserSession(sessionToken: string): Promise<UserSession | undefined> {
    const result = await this.db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));
    return result[0];
  }

  async getAllUserSessions(): Promise<UserSession[]> {
    return await this.db.select().from(userSessions);
  }

  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const result = await this.db
      .insert(userSessions)
      .values(insertSession)
      .returning();
    return result[0];
  }

  async updateUserSessionPoints(sessionToken: string, points: number): Promise<UserSession | undefined> {
    const result = await this.db
      .update(userSessions)
      .set({
        totalPoints: sql`${userSessions.totalPoints} + ${points}`,
        lastActive: new Date(),
      })
      .where(eq(userSessions.sessionToken, sessionToken))
      .returning();
    return result[0];
  }

  async addCompletedChallenge(sessionToken: string, challengeId: string): Promise<UserSession | undefined> {
    const session = await this.getUserSession(sessionToken);
    if (!session) return undefined;

    const completed = Array.isArray(session.completedChallenges) 
      ? session.completedChallenges as string[]
      : [];

    if (completed.includes(challengeId)) {
      return session;
    }

    const result = await this.db
      .update(userSessions)
      .set({
        completedChallenges: [...completed, challengeId],
        lastActive: new Date(),
      })
      .where(eq(userSessions.sessionToken, sessionToken))
      .returning();
    
    return result[0];
  }
}

export const storage = new PostgresStorage();
