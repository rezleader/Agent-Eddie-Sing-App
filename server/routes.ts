import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { mkdir } from "fs/promises";
import { insertSongSchema, insertChallengeSchema, type InsertSong, type InsertChallenge } from "@shared/schema";
import { randomUUID } from "crypto";
import { acrCloudService } from "./acrcloud-service";
import { acrCloudUploadService } from "./acrcloud-upload";
import { readFile } from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

// Configure multer for audio file uploads
// Use /tmp/uploads for production compatibility (writable in deployments)
const uploadDir = process.env.UPLOAD_DIR || path.join("/tmp", "uploads");

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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for audio files
  fileFilter: (_req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Get audio duration using ffprobe
async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('[Audio Duration] ffprobe error:', err.message);
        console.error('[Audio Duration] Make sure ffmpeg/ffprobe is installed on the system');
        // Provide fallback duration of 180 seconds (3 minutes) if detection fails
        console.warn('[Audio Duration] Using fallback duration: 180 seconds');
        resolve(180);
      } else {
        const duration = Math.round(metadata.format.duration || 0);
        if (duration === 0) {
          console.warn('[Audio Duration] Could not detect duration, using fallback: 180 seconds');
          resolve(180);
        } else {
          console.log(`[Audio Duration] Detected: ${duration} seconds`);
          resolve(duration);
        }
      }
    });
  });
}

// Convert WebM/audio to PCM WAV for better ACRCloud recognition
async function convertToPCMWav(inputPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const outputStream = new PassThrough();
    
    outputStream.on('data', (chunk) => chunks.push(chunk));
    outputStream.on('end', () => resolve(Buffer.concat(chunks)));
    outputStream.on('error', reject);
    
    console.log('[Audio Conversion] Converting to PCM WAV for ACRCloud...');
    
    ffmpeg(inputPath)
      .audioFrequency(44100)  // 44.1 kHz sample rate
      .audioChannels(1)        // Mono
      .audioCodec('pcm_s16le') // 16-bit PCM
      .format('wav')
      .on('error', (err) => {
        console.error('[Audio Conversion] Error:', err.message);
        reject(err);
      })
      .on('end', () => {
        console.log('[Audio Conversion] ✅ Conversion complete');
      })
      .pipe(outputStream, { end: true });
  });
}

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

      // Auto-detect duration from audio file
      const duration = await getAudioDuration(req.file.path);

      const songData: InsertSong = {
        title: req.body.title,
        artist: req.body.artist || "Eddie Sing & The 31 Days",
        album: req.body.album || null,
        spotifyLink: req.body.spotifyLink || null,
        duration: duration,
        audioPath: `/uploads/${req.file.filename}`,
        albumArt: req.body.albumArt || null,
      };

      const validated = insertSongSchema.parse(songData);
      let song = await storage.createSong(validated);
      
      // Also upload to ACRCloud if configured
      if (acrCloudUploadService.isReady()) {
        console.log(`[Song Upload] Uploading "${validated.title}" to ACRCloud...`);
        const acrId = await acrCloudUploadService.uploadAudioFile(
          req.file.path,
          validated.title,
          validated.artist || "Eddie Sing & The 31 Days",
          song.id,
          validated.album || undefined
        );
        if (acrId) {
          console.log(`[Song Upload] ✅ ACRCloud upload successful: ${acrId}`);
          // Update song with fingerprint ID
          const updatedSong = await storage.updateSong(song.id, { audioFingerprint: acrId });
          if (updatedSong) {
            song = updatedSong;
            console.log(`[Song Upload] ✅ Fingerprint ID saved to database`);
          }
        } else {
          console.warn(`[Song Upload] ⚠️ ACRCloud upload failed for "${validated.title}"`);
        }
      }
      
      res.status(201).json(song);
    } catch (error) {
      console.error("Error creating song:", error);
      res.status(400).json({ error: "Invalid song data" });
    }
  });

  app.patch("/api/songs/:id", async (req, res) => {
    try {
      const updateData: Partial<InsertSong> = {};
      
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.artist) updateData.artist = req.body.artist;
      if (req.body.album !== undefined) updateData.album = req.body.album || null;
      if (req.body.spotifyLink !== undefined) updateData.spotifyLink = req.body.spotifyLink || null;
      if (req.body.duration) updateData.duration = parseInt(req.body.duration);

      const song = await storage.updateSong(req.params.id, updateData);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      console.error("Error updating song:", error);
      res.status(500).json({ error: "Failed to update song" });
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

  // Song recognition endpoint with ACRCloud integration
  app.post("/api/recognize", upload.single('audioFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      const songs = await storage.getSongs();
      if (songs.length === 0) {
        return res.status(404).json({ error: "No songs in database" });
      }

      // Try ACRCloud recognition if configured
      if (acrCloudService.isReady()) {
        console.log('[Recognition] Using ACRCloud for song identification...');
        
        // Convert WebM to PCM WAV for better fingerprint matching
        // This removes double-lossy encoding and matches ACRCloud's requirements
        const convertedBuffer = await convertToPCMWav(req.file.path);
        
        // Recognize using ACRCloud with converted audio
        const recognition = await acrCloudService.recognizeAudio(convertedBuffer);
        
        if (recognition) {
          // Match ACRCloud result to our database songs
          // Compare normalized titles (remove special chars, lowercase)
          const normalizeTitle = (title: string) => 
            title.toLowerCase()
              .replace(/\(ai reimagined\)/gi, '')
              .replace(/\(featuring [^)]+\)/gi, '')
              .trim();
          
          const matchedSong = songs.find(song => {
            const dbTitle = normalizeTitle(song.title);
            const recognizedTitle = normalizeTitle(recognition.title);
            return dbTitle.includes(recognizedTitle) || recognizedTitle.includes(dbTitle);
          });

          if (matchedSong) {
            // Calculate segment from play offset (time in song)
            // Segments are 60-second intervals: 0-59s = segment 1, 60-119s = segment 2, etc.
            const offsetSeconds = recognition.playOffsetMs / 1000;
            const detectedSegment = Math.min(4, Math.max(1, Math.floor(offsetSeconds / 60) + 1));
            
            // Get challenges for this segment
            const segmentChallenges = await storage.getChallengesBySegment(matchedSong.id, detectedSegment);
            
            console.log(`[Recognition] ✅ Matched: "${recognition.title}" → "${matchedSong.title}", Segment: ${detectedSegment} (${offsetSeconds.toFixed(1)}s), Confidence: ${(recognition.confidence * 100).toFixed(0)}%`);

            return res.json({
              song: matchedSong,
              challenges: segmentChallenges,
              segment: detectedSegment,
              confidence: recognition.confidence,
            });
          } else {
            console.log(`[Recognition] ⚠️ ACRCloud found "${recognition.title}" but no database match`);
          }
        } else {
          console.log('[Recognition] ⚠️ ACRCloud could not identify the audio');
        }
      }

      // Fallback: Return mock data if ACRCloud not configured or failed
      console.log('[Recognition] Using fallback mode (mock data)');
      const matchedSong = songs[0];
      const detectedSegment = Math.floor(Math.random() * 4) + 1;
      const segmentChallenges = await storage.getChallengesBySegment(matchedSong.id, detectedSegment);
      
      console.log(`[Recognition] Fallback: ${matchedSong.title}, Segment: ${detectedSegment}`);

      res.json({
        song: matchedSong,
        challenges: segmentChallenges,
        segment: detectedSegment,
        confidence: 0.50, // Lower confidence for fallback
      });
    } catch (error) {
      console.error("[Recognition] Error:", error);
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
