import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class FingerprintService {
  private binaryPath: string;

  constructor() {
    // Path to the ACRCloud fingerprint extraction binary
    this.binaryPath = path.join(process.cwd(), 'scripts', 'acrcloud_extr_tool');
    
    if (!fs.existsSync(this.binaryPath)) {
      console.warn('[Fingerprint] ACRCloud extraction tool not found at:', this.binaryPath);
    } else {
      console.log('[Fingerprint] Service initialized with binary at:', this.binaryPath);
    }
  }

  /**
   * Generate ACRCloud fingerprint from an audio file
   * @param audioFilePath Path to the source audio file (MP3, WAV, etc.)
   * @param outputFilePath Optional custom output path for the .acr file
   * @returns Path to the generated .acr fingerprint file
   */
  async generateFingerprint(audioFilePath: string, outputFilePath?: string): Promise<string> {
    if (!fs.existsSync(this.binaryPath)) {
      throw new Error('ACRCloud extraction tool not found. Binary should be at: ' + this.binaryPath);
    }

    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Audio file not found: ' + audioFilePath);
    }

    // Default output path: same location as input file with .acr extension
    const defaultOutputPath = audioFilePath.replace(/\.[^.]+$/, '.acr');
    const finalOutputPath = outputFilePath || defaultOutputPath;

    try {
      console.log(`[Fingerprint] Generating fingerprint for: ${path.basename(audioFilePath)}`);
      console.log(`[Fingerprint] Output will be: ${path.basename(finalOutputPath)}`);

      // Build the command
      // -i: input file
      // -o: output file
      // Do NOT use -cli flag (that's for recognition, we want database fingerprint)
      const command = `"${this.binaryPath}" -i "${audioFilePath}" -o "${finalOutputPath}"`;

      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(command);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (stdout) console.log('[Fingerprint] Output:', stdout.trim());
      if (stderr) console.error('[Fingerprint] Stderr:', stderr.trim());

      // Verify the fingerprint file was created
      if (!fs.existsSync(finalOutputPath)) {
        throw new Error('Fingerprint file was not created: ' + finalOutputPath);
      }

      const fileSize = fs.statSync(finalOutputPath).size;
      console.log(`[Fingerprint] ✅ Generated successfully in ${duration}s (${fileSize} bytes)`);

      return finalOutputPath;
    } catch (error) {
      console.error('[Fingerprint] Error generating fingerprint:', error);
      throw new Error(`Failed to generate fingerprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate fingerprint and clean up the source audio file
   * Useful for temporary audio files that are no longer needed
   */
  async generateFingerprintAndCleanup(audioFilePath: string, outputFilePath?: string): Promise<string> {
    const fingerprintPath = await this.generateFingerprint(audioFilePath, outputFilePath);
    
    // Optionally clean up the original audio file if needed
    // (Commented out for safety - enable if you want to auto-delete source files)
    // try {
    //   fs.unlinkSync(audioFilePath);
    //   console.log(`[Fingerprint] Cleaned up source audio: ${path.basename(audioFilePath)}`);
    // } catch (error) {
    //   console.warn(`[Fingerprint] Could not delete source file:`, error);
    // }
    
    return fingerprintPath;
  }

  /**
   * Check if the fingerprint service is ready to use
   */
  isReady(): boolean {
    return fs.existsSync(this.binaryPath);
  }
}

export const fingerprintService = new FingerprintService();
