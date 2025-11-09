import { Response } from "express";
import { Storage } from "@google-cloud/storage";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

// Initialize Google Cloud Storage client
// In development: uses sidecar authentication
// In production: uses default application credentials
function createStorageClient(): Storage {
  // Detect if we're in production deployment (no sidecar available)
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  
  if (isProduction) {
    console.log("[ObjectStorage] Using production credentials (application default)");
    // In production, use default application credentials provided by Replit
    return new Storage({
      projectId: "",
    });
  } else {
    console.log("[ObjectStorage] Using development credentials (sidecar)");
    // In development, use sidecar authentication
    return new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token",
          },
        },
        universe_domain: "googleapis.com",
      },
      projectId: "",
    });
  }
}

const objectStorageClient = createStorageClient();

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectDir(): string {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = pathsStr.split(",").map((p) => p.trim()).filter(Boolean);
    if (paths.length === 0) {
      throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not configured");
    }
    return paths[0]; // Use first public path
  }

  async generateSignedUploadUrl(destinationPath: string, contentType: string): Promise<{ signedUrl: string; publicPath: string }> {
    const publicDir = this.getPublicObjectDir();
    // Normalize destination path (remove leading slash, prevent traversal)
    const normalizedDest = destinationPath.replace(/^\/+/, "").replace(/\.\./g, "");
    const fullPath = `${publicDir}/${normalizedDest}`;
    const { bucketName, objectName } = this.parseObjectPath(fullPath);

    console.log(`[ObjectStorage] Generating signed URL for bucket: ${bucketName}, object: ${objectName}`);
    
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    
    // Generate signed URL for PUT upload (valid for 15 minutes)
    // Note: File size is validated in the request-upload endpoint
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
    });

    console.log(`[ObjectStorage] ✅ Signed URL generated`);
    return {
      signedUrl,
      publicPath: `/public-objects/${normalizedDest}`
    };
  }

  async uploadToPublic(localFilePath: string, destinationPath: string, mimeType: string = "audio/wav"): Promise<string> {
    const publicDir = this.getPublicObjectDir();
    // Normalize destination path (remove leading slash, prevent traversal)
    const normalizedDest = destinationPath.replace(/^\/+/, "").replace(/\.\./g, "");
    const fullPath = `${publicDir}/${normalizedDest}`;
    const { bucketName, objectName } = this.parseObjectPath(fullPath);

    console.log(`[ObjectStorage] Uploading to bucket: ${bucketName}, object: ${objectName}`);
    
    // Use Google Cloud Storage SDK's upload method (correct usage)
    const bucket = objectStorageClient.bucket(bucketName);
    await bucket.upload(localFilePath, {
      destination: objectName,
      metadata: {
        contentType: mimeType,
      },
    });

    console.log(`[ObjectStorage] ✅ Upload successful`);
    return `/public-objects/${normalizedDest}`;
  }

  async downloadObject(objectPath: string, res: Response) {
    const publicDir = this.getPublicObjectDir();
    const fullPath = `${publicDir}/${objectPath}`;
    const { bucketName, objectName } = this.parseObjectPath(fullPath);

    try {
      // Use Google Cloud Storage SDK for download (works in both dev and production)
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new ObjectNotFoundError();
      }

      // Get file metadata
      const [metadata] = await file.getMetadata();
      
      // Set headers
      res.set({
        "Content-Type": metadata.contentType || "audio/wav",
        "Content-Length": metadata.size?.toString() || "",
        "Cache-Control": "public, max-age=31536000",
      });

      // Stream the file directly to response
      file.createReadStream()
        .on("error", (err) => {
          console.error("Stream error:", err);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error streaming file" });
          }
        })
        .pipe(res);
        
    } catch (error) {
      console.error("Error downloading object:", error);
      if (error instanceof ObjectNotFoundError) {
        if (!res.headersSent) {
          res.status(404).json({ error: "File not found" });
        }
      } else {
        if (!res.headersSent) {
          res.status(500).json({ error: "Error downloading file" });
        }
      }
    }
  }

  private parseObjectPath(path: string): { bucketName: string; objectName: string } {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2) {
      throw new Error("Invalid path format");
    }
    return {
      bucketName: parts[0],
      objectName: parts.slice(1).join("/"),
    };
  }
}
