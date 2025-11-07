import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

interface ACRCloudUploadResponse {
  success?: boolean;
  data?: {
    acrid?: string;
    audio_id?: string;
    title?: string;
  };
  error?: {
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

  async uploadAudioFile(filePath: string, title: string, artist: string, album?: string): Promise<string | null> {
    if (!this.isConfigured) {
      console.warn('[ACRCloud Upload] Service not configured, cannot upload');
      return null;
    }

    try {
      console.log(`[ACRCloud Upload] Uploading "${title}" to bucket ${this.bucketId}...`);

      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('title', title);
      form.append('data_type', 'audio');
      
      // Add metadata as JSON string
      const metadata: Record<string, string> = { artist };
      if (album) metadata.album = album;
      form.append('user_defined', JSON.stringify(metadata));

      const url = `${this.baseUrl}/api/buckets/${this.bucketId}/files`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.bearerToken}`,
          ...form.getHeaders(),
        },
        body: form,
      });

      const result = await response.json() as ACRCloudUploadResponse;

      if (response.ok && result.data?.acrid) {
        console.log(`[ACRCloud Upload] ✅ Uploaded successfully: ${result.data.acrid}`);
        return result.data.acrid;
      } else {
        console.error('[ACRCloud Upload] Upload failed:', result.error?.message || 'Unknown error');
        return null;
      }
    } catch (error) {
      console.error('[ACRCloud Upload] Error uploading file:', error);
      return null;
    }
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}

export const acrCloudUploadService = new ACRCloudUploadService();
