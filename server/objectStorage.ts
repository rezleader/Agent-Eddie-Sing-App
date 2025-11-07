import { Response } from "express";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";
import fetch from "node-fetch";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

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

  async uploadToPublic(localFilePath: string, destinationPath: string, mimeType: string = "audio/wav"): Promise<string> {
    const publicDir = this.getPublicObjectDir();
    // Normalize destination path (remove leading slash, prevent traversal)
    const normalizedDest = destinationPath.replace(/^\/+/, "").replace(/\.\./g, "");
    const fullPath = `${publicDir}/${normalizedDest}`;
    const { bucketName, objectName } = this.parseObjectPath(fullPath);

    // Get signed URL for upload
    const signedUrl = await this.getSignedUrl(bucketName, objectName, "PUT");
    
    // Stream upload instead of loading into memory
    const stats = statSync(localFilePath);
    const fileStream = createReadStream(localFilePath);
    
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: fileStream as any,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": stats.size.toString(),
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    return `/public-objects/${normalizedDest}`;
  }

  async downloadObject(objectPath: string, res: Response) {
    const publicDir = this.getPublicObjectDir();
    const fullPath = `${publicDir}/${objectPath}`;
    const { bucketName, objectName } = this.parseObjectPath(fullPath);

    try {
      // Get signed URL for download
      const signedUrl = await this.getSignedUrl(bucketName, objectName, "GET");
      
      // Fetch the file
      const response = await fetch(signedUrl);
      if (!response.ok) {
        if (response.status === 404) {
          throw new ObjectNotFoundError();
        }
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Set headers
      res.set({
        "Content-Type": response.headers.get("content-type") || "audio/wav",
        "Content-Length": response.headers.get("content-length") || "",
        "Cache-Control": "public, max-age=31536000",
      });

      // Convert Web ReadableStream to Node stream and pipe
      if (response.body) {
        const nodeStream = Readable.fromWeb(response.body as any);
        nodeStream.pipe(res);
      } else {
        throw new Error("No response body");
      }
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

  private async getSignedUrl(
    bucketName: string,
    objectName: string,
    method: "GET" | "PUT"
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    
    const response = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket_name: bucketName,
          object_name: objectName,
          method,
          expires_at: expiresAt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data = await response.json() as { signed_url: string };
    return data.signed_url;
  }
}
