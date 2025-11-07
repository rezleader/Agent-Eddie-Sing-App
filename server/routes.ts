import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { mkdir } from "fs/promises";
import { insertSongSchema, insertChallengeSchema, type InsertSong, type InsertChallenge } from "@shared/schema";
import { randomUUID } from "crypto";

// Configure multer for audio file uploads
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage_config = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static(uploadDir));

  // Songs endpoints
  app.get("/api/songs", async (_req, res) => {
    try {
      const songs = await storage.getSongs();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/:id", async (req, res) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch song" });
    }
  });

  app.post("/api/songs", upload.single('audioFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      const songData: InsertSong = {
        title: req.body.title,
        artist: req.body.artist || "Eddie Sing & The 31 Days",
        album: req.body.album || null,
        duration: parseInt(req.body.duration),
        audioPath: `/uploads/${req.file.filename}`,
        albumArt: req.body.albumArt || null,
      };

      const validated = insertSongSchema.parse(songData);
      const song = await storage.createSong(validated);
      res.status(201).json(song);
    } catch (error) {
      console.error("Error creating song:", error);
      res.status(400).json({ error: "Invalid song data" });
    }
  });

  app.delete("/api/songs/:id", async (req, res) => {
    try {
      await storage.deleteSong(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete song" });
    }
  });

  // Challenges endpoints
  app.get("/api/challenges", async (_req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.getChallenge(req.params.id);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenge" });
    }
  });

  app.get("/api/songs/:songId/challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallengesBySong(req.params.songId);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges for song" });
    }
  });

  app.get("/api/songs/:songId/challenges/segment/:segment", async (req, res) => {
    try {
      const segment = parseInt(req.params.segment);
      if (segment < 1 || segment > 4) {
        return res.status(400).json({ error: "Segment must be between 1 and 4" });
      }
      const challenges = await storage.getChallengesBySegment(req.params.songId, segment);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges for segment" });
    }
  });

  app.post("/api/challenges", async (req, res) => {
    try {
      const validated = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(validated);
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(400).json({ error: "Invalid challenge data" });
    }
  });

  app.delete("/api/challenges/:id", async (req, res) => {
    try {
      await storage.deleteChallenge(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete challenge" });
    }
  });

  // User sessions endpoints
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionToken = randomUUID();
      const session = await storage.createUserSession({ sessionToken });
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/sessions/:sessionToken", async (req, res) => {
    try {
      const session = await storage.getUserSession(req.params.sessionToken);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions/:sessionToken/complete-challenge", async (req, res) => {
    try {
      const { challengeId } = req.body;
      if (!challengeId) {
        return res.status(400).json({ error: "Challenge ID is required" });
      }

      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }

      // Add to completed challenges
      let session = await storage.addCompletedChallenge(req.params.sessionToken, challengeId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Update points
      session = await storage.updateUserSessionPoints(req.params.sessionToken, challenge.points);
      
      res.json(session);
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ error: "Failed to complete challenge" });
    }
  });

  // Song recognition endpoint with segment detection
  app.post("/api/recognize", upload.single('audioFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      // TODO: Implement real audio fingerprinting to identify the song
      // For now, return the first song as a mock match
      const songs = await storage.getSongs();
      if (songs.length === 0) {
        return res.status(404).json({ error: "No songs in database" });
      }

      const matchedSong = songs[0]; // Mock: return first song
      
      // TODO: Implement real audio analysis to detect which segment (minute) of the song
      // This would involve:
      // 1. Analyzing the audio characteristics (tempo, pitch, spectral features)
      // 2. Comparing against stored fingerprints for each segment of the song
      // 3. Determining which minute segment (1-4) best matches
      
      // For now, mock segment detection (randomly select 1-4)
      // In production, this would be based on actual audio analysis
      const detectedSegment = Math.floor(Math.random() * 4) + 1; // Random 1-4
      
      // Get challenges only for the detected segment
      const segmentChallenges = await storage.getChallengesBySegment(matchedSong.id, detectedSegment);
      
      console.log(`Recognized: ${matchedSong.title}, Segment: ${detectedSegment}, Challenges: ${segmentChallenges.length}`);

      res.json({
        song: matchedSong,
        challenges: segmentChallenges,
        segment: detectedSegment,
        confidence: 0.95, // Mock confidence score
      });
    } catch (error) {
      console.error("Error recognizing song:", error);
      res.status(500).json({ error: "Failed to recognize song" });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const allSessions = await storage.getAllUserSessions();
      const requestSessionToken = req.query.sessionToken as string | undefined;
      
      // Sort by total points descending
      const sortedSessions = allSessions
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 100); // Top 100 players
      
      // Sanitize response - don't expose session tokens
      const sanitizedLeaderboard = sortedSessions.map((session, index) => {
        const completedCount = Array.isArray(session.completedChallenges) 
          ? (session.completedChallenges as string[]).length 
          : 0;
        
        return {
          rank: index + 1,
          playerId: session.id.substring(0, 8), // Use session ID, not token
          totalPoints: session.totalPoints || 0,
          completedChallenges: completedCount,
          isCurrentUser: requestSessionToken ? session.sessionToken === requestSessionToken : false,
        };
      });
      
      res.json(sanitizedLeaderboard);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Admin stats endpoint
  app.get("/api/admin/stats", async (_req, res) => {
    try {
      const songs = await storage.getSongs();
      const challenges = await storage.getChallenges();
      const allSessions = await storage.getAllUserSessions();
      
      // Calculate total points distributed (sum of all completed challenges across all sessions)
      const totalPoints = allSessions.reduce((sum: number, session) => sum + (session.totalPoints || 0), 0);
      
      res.json({
        totalSongs: songs.length,
        totalChallenges: challenges.length,
        totalUsers: allSessions.length,
        totalPoints: totalPoints,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
