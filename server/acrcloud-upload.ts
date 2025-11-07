import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';
import { fingerprintService } from './fingerprint-service';

interface ACRCloudUploadResponse {
  success?: boolean;
  data?: {
    acr_id?: string;  // ACRCloud uses "acr_id" not "acrid"
    acrid?: string;   // Keep for backwards compatibility
    audio_id?: string;
    title?: string;
  };
  error?: string | {
    code?: number;
    message?: string;
  };
}

export class ACRCloudUploadService {
  private bucketId: string | null = null;
  private bearerToken: string | null = null;
  private isConfigured: boolean = false;
  private baseUrl = 'https://api-v2.acrcloud.com';

  constructor() {
    this.bucketId = process.env.ACRCLOUD_BUCKET_ID || null;
    this.bearerToken = process.env.ACRCLOUD_BEARER_TOKEN || null;

    if (this.bucketId && this.bearerToken) {
      this.isConfigured = true;
      console.log('[ACRCloud Upload] Service initialized successfully');
    } else {
      console.warn('[ACRCloud Upload] Not configured. Missing ACRCLOUD_BUCKET_ID or ACRCLOUD_BEARER_TOKEN.');
      this.isConfigured = false;
    }
  }

  /**
   * Upload audio file as fingerprint to ACRCloud bucket
   * This generates a robust fingerprint that works with compressed audio (like SoundCloud)
   * @param songId - Unique identifier for the song (prevents duplicates via custom_file_id)
   */
  async uploadAudioFile(filePath: string, title: string, artist: string, songId: string, album?: string | null): Promise<string | null> {
    if (!this.isConfigured) {
      console.warn('[ACRCloud Upload] Service not configured, cannot upload');
      return null;
    }

    if (!fingerprintService.isReady()) {
      console.error('[ACRCloud Upload] Fingerprint service not ready. Cannot generate fingerprints.');
      return null;
    }

    let fingerprintPath: string | null = null;

    try {
      console.log(`[ACRCloud Upload] Processing "${title}" for fingerprint upload...`);

      // Step 1: Generate fingerprint from audio file
      fingerprintPath = await fingerprintService.generateFingerprint(filePath);

      // Step 2: Upload fingerprint to ACRCloud bucket
      console.log(`[ACRCloud Upload] Uploading fingerprint to bucket ${this.bucketId}...`);

      const form = new FormData();
      form.append('file', fs.createReadStream(fingerprintPath));
      form.append('title', title);
      form.append('data_type', 'fingerprint'); // KEY CHANGE: Upload as fingerprint, not audio
      form.append('custom_file_id', songId); // CRITICAL: Makes uploads idempotent - prevents duplicates!
      
      // Add metadata as JSON string
      const metadata: Record<string, string> = { artist };
      if (album) metadata.album = album;
      form.append('user_defined', JSON.stringify(metadata));

      const url = `${this.baseUrl}/api/buckets/${this.bucketId}/files`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.bearerToken}`, // Add "Bearer " prefix to token
          ...form.getHeaders(),
        },
        body: form,
      });

      const result = await response.json() as ACRCloudUploadResponse;

      // ACRCloud returns 201 Created on success, and the field is "acr_id" not "acrid"
      const acrid = result.data?.acr_id || result.data?.acrid;
      
      if (response.ok && acrid) {
        console.log(`[ACRCloud Upload] ✅ Fingerprint uploaded successfully: ${acrid}`);
        return acrid;
      } else {
        console.error('[ACRCloud Upload] Fingerprint upload failed:');
        console.error('  Status:', response.status, response.statusText);
        console.error('  Response:', JSON.stringify(result, null, 2));
        return null;
      }
    } catch (error) {
      console.error('[ACRCloud Upload] Error during fingerprint upload:', error);
      return null;
    } finally {
      // Step 3: Clean up temporary fingerprint file
      if (fingerprintPath && fs.existsSync(fingerprintPath)) {
        try {
          fs.unlinkSync(fingerprintPath);
          console.log(`[ACRCloud Upload] Cleaned up fingerprint file`);
        } catch (cleanupError) {
          console.warn('[ACRCloud Upload] Could not delete fingerprint file:', cleanupError);
        }
      }
    }
  }

  isReady(): boolean {
    return this.isConfigured && fingerprintService.isReady();
  }
}

export const acrCloudUploadService = new ACRCloudUploadService();
