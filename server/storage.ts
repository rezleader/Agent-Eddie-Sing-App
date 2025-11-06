import { type Song, type InsertSong, type Challenge, type InsertChallenge, type UserSession, type InsertUserSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Songs
  getSongs(): Promise<Song[]>;
  getSong(id: string): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;
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
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSessionPoints(sessionToken: string, points: number): Promise<UserSession | undefined>;
  addCompletedChallenge(sessionToken: string, challengeId: string): Promise<UserSession | undefined>;
}

export class MemStorage implements IStorage {
  private songs: Map<string, Song>;
  private challenges: Map<string, Challenge>;
  private userSessions: Map<string, UserSession>;

  constructor() {
    this.songs = new Map();
    this.challenges = new Map();
    this.userSessions = new Map();
  }

  // Songs
  async getSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async getSong(id: string): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const id = randomUUID();
    const song: Song = {
      id,
      ...insertSong,
      audioFingerprint: null,
      createdAt: new Date(),
    };
    this.songs.set(id, song);
    return song;
  }

  async deleteSong(id: string): Promise<void> {
    this.songs.delete(id);
    // Also delete associated challenges
    const challengesToDelete = Array.from(this.challenges.values())
      .filter(c => c.songId === id);
    challengesToDelete.forEach(c => this.challenges.delete(c.id));
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getChallengesBySong(songId: string): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.songId === songId
    );
  }

  async getChallengesBySegment(songId: string, segment: number): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.songId === songId && challenge.segment === segment
    );
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = randomUUID();
    const challenge: Challenge = {
      id,
      ...insertChallenge,
      songId: insertChallenge.songId || null,
      createdAt: new Date(),
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async deleteChallenge(id: string): Promise<void> {
    this.challenges.delete(id);
  }

  // User Sessions
  async getUserSession(sessionToken: string): Promise<UserSession | undefined> {
    return Array.from(this.userSessions.values()).find(
      (session) => session.sessionToken === sessionToken
    );
  }

  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const id = randomUUID();
    const session: UserSession = {
      id,
      ...insertSession,
      totalPoints: 0,
      completedChallenges: [],
      createdAt: new Date(),
      lastActive: new Date(),
    };
    this.userSessions.set(id, session);
    return session;
  }

  async updateUserSessionPoints(sessionToken: string, points: number): Promise<UserSession | undefined> {
    const session = await this.getUserSession(sessionToken);
    if (session) {
      session.totalPoints += points;
      session.lastActive = new Date();
      this.userSessions.set(session.id, session);
      return session;
    }
    return undefined;
  }

  async addCompletedChallenge(sessionToken: string, challengeId: string): Promise<UserSession | undefined> {
    const session = await this.getUserSession(sessionToken);
    if (session) {
      const completed = Array.isArray(session.completedChallenges) 
        ? session.completedChallenges as string[]
        : [];
      
      if (!completed.includes(challengeId)) {
        session.completedChallenges = [...completed, challengeId];
        session.lastActive = new Date();
        this.userSessions.set(session.id, session);
      }
      return session;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
