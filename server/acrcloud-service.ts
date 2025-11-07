// @ts-ignore - acrcloud package lacks proper TypeScript definitions
import ACRCloud from 'acrcloud';

interface ACRCloudConfig {
  host: string;
  access_key: string;
  access_secret: string;
}

interface ACRCloudMusic {
  title: string;
  artists: Array<{ name: string }>;
  album?: { name: string };
  play_offset_ms: number;
  score: number;
  duration_ms?: number;
}

interface ACRCloudResponse {
  status: {
    msg: string;
    code: number;
  };
  metadata?: {
    music?: ACRCloudMusic[];
  };
}

export interface RecognitionResult {
  title: string;
  artist: string;
  album?: string;
  playOffsetMs: number;
  confidence: number;
  durationMs?: number;
}

export class ACRCloudService {
  private client: any;
  private isConfigured: boolean = false;

  constructor() {
    const host = process.env.ACRCLOUD_HOST;
    const accessKey = process.env.ACRCLOUD_ACCESS_KEY;
    const accessSecret = process.env.ACRCLOUD_ACCESS_SECRET;

    if (host && accessKey && accessSecret) {
      this.client = new ACRCloud({
        host,
        access_key: accessKey,
        access_secret: accessSecret,
      });
      this.isConfigured = true;
      console.log('[ACRCloud] Service initialized successfully');
    } else {
      console.warn('[ACRCloud] API credentials not configured. Recognition will use fallback mode.');
      this.isConfigured = false;
    }
  }

  async recognizeAudio(audioBuffer: Buffer): Promise<RecognitionResult | null> {
    if (!this.isConfigured) {
      console.warn('[ACRCloud] Service not configured, cannot recognize audio');
      return null;
    }

    try {
      console.log('[ACRCloud] Starting audio recognition...');
      const response: ACRCloudResponse = await this.client.identify(audioBuffer);

      if (response.status.code !== 0) {
        console.log(`[ACRCloud] Recognition failed: ${response.status.msg}`);
        return null;
      }

      const music = response.metadata?.music?.[0];
      if (!music) {
        console.log('[ACRCloud] No music found in response');
        return null;
      }

      const result: RecognitionResult = {
        title: music.title,
        artist: music.artists.map(a => a.name).join(', '),
        album: music.album?.name,
        playOffsetMs: music.play_offset_ms,
        confidence: music.score / 100, // Convert 0-100 to 0-1
        durationMs: music.duration_ms,
      };

      console.log('[ACRCloud] Recognition successful:', {
        title: result.title,
        artist: result.artist,
        offset: `${(result.playOffsetMs / 1000).toFixed(1)}s`,
        confidence: `${(result.confidence * 100).toFixed(0)}%`,
      });

      return result;
    } catch (error) {
      console.error('[ACRCloud] Recognition error:', error);
      return null;
    }
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}

export const acrCloudService = new ACRCloudService();
