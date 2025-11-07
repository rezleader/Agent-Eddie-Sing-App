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
    custom_files?: ACRCloudMusic[];
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
      console.log('[ACRCloud] Audio buffer size:', audioBuffer.length, 'bytes');
      console.log('[ACRCloud] Searching custom bucket (project 87689)...');
      
      const response: ACRCloudResponse = await this.client.identify(audioBuffer, { 
        recognize_type: 'audio',
        custom_records: 1 
      });
      
      console.log('[ACRCloud] Full response:', JSON.stringify(response, null, 2));

      if (response.status.code !== 0) {
        console.log(`[ACRCloud] Recognition failed: ${response.status.msg} (code: ${response.status.code})`);
        return null;
      }

      const music = response.metadata?.music?.[0];
      const customFiles = response.metadata?.custom_files?.[0];
      
      console.log('[ACRCloud] Music found:', music ? 'YES' : 'NO');
      console.log('[ACRCloud] Custom files found:', customFiles ? 'YES' : 'NO');
      
      if (!music && !customFiles) {
        console.log('[ACRCloud] No music or custom files found in response');
        console.log('[ACRCloud] Full metadata:', JSON.stringify(response.metadata, null, 2));
        return null;
      }

      // Prefer custom files over commercial music
      const source = customFiles || music;
      
      if (!source) {
        console.log('[ACRCloud] Source is null/undefined');
        return null;
      }
      
      const result: RecognitionResult = {
        title: source.title,
        artist: source.artists?.map((a: any) => a.name).join(', ') || 'Unknown',
        album: source.album?.name,
        playOffsetMs: source.play_offset_ms || 0,
        confidence: source.score / 100, // Convert 0-100 to 0-1
        durationMs: source.duration_ms,
      };

      console.log('[ACRCloud] Recognition successful:', {
        title: result.title,
        artist: result.artist,
        offset: `${(result.playOffsetMs / 1000).toFixed(1)}s`,
        confidence: `${(result.confidence * 100).toFixed(0)}%`,
        source: customFiles ? 'CUSTOM_BUCKET' : 'COMMERCIAL_DB'
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
