import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Song, type Challenge, type UserSession } from "@shared/schema";

// Songs hooks
export function useSongs() {
  return useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });
}

export function useSong(id: string | null) {
  return useQuery<Song>({
    queryKey: ["/api/songs", id],
    enabled: !!id,
  });
}

export function useCreateSong() {
  return useMutation({
    mutationFn: async (data: { title: string; artist: string; album?: string; audioFile: File }) => {
      console.log('[Upload] Starting 3-step upload process...');
      console.log('[Upload] File:', data.audioFile.name, 'Size:', data.audioFile.size, 'Type:', data.audioFile.type);
      
      // Step 1: Request signed URL from backend
      console.log('[Upload] Step 1: Requesting signed URL...');
      const requestResponse = await fetch("/api/songs/request-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: data.audioFile.name,
          contentType: data.audioFile.type,
          fileSize: data.audioFile.size,
        }),
      });

      if (!requestResponse.ok) {
        console.error('[Upload] Step 1 FAILED:', requestResponse.status, requestResponse.statusText);
        const error = await requestResponse.json();
        throw new Error(error.error || "Failed to request upload URL");
      }

      const { signedUrl, publicPath, fileName } = await requestResponse.json();
      console.log('[Upload] Step 1 SUCCESS - Got signed URL');

      // Step 2: Upload file directly to Google Cloud Storage
      console.log('[Upload] Step 2: Uploading to Google Cloud Storage...');
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": data.audioFile.type,
        },
        body: data.audioFile,
      });

      if (!uploadResponse.ok) {
        console.error('[Upload] Step 2 FAILED:', uploadResponse.status, uploadResponse.statusText);
        throw new Error("Failed to upload file to storage");
      }

      console.log('[Upload] Step 2 SUCCESS - File uploaded to GCS');

      // Step 3: Confirm upload and create song record
      console.log('[Upload] Step 3: Confirming upload with backend...');
      const confirmResponse = await fetch("/api/songs/confirm-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          artist: data.artist,
          album: data.album,
          audioPath: publicPath,
          fileName: fileName,
          contentType: data.audioFile.type,
        }),
      });

      if (!confirmResponse.ok) {
        console.error('[Upload] Step 3 FAILED:', confirmResponse.status, confirmResponse.statusText);
        throw new Error("Failed to confirm upload");
      }

      console.log('[Upload] Step 3 SUCCESS - Song created in database');
      return confirmResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

export function useUpdateSong() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; artist: string; album?: string; spotifyLink?: string; duration: number } }) => {
      return await apiRequest("PATCH", `/api/songs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
  });
}

export function useDeleteSong() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/songs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

// Challenges hooks
export function useChallenges() {
  return useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });
}

export function useSongChallenges(songId: string | null) {
  return useQuery<Challenge[]>({
    queryKey: ["/api/songs", songId, "challenges"],
    enabled: !!songId,
  });
}

export function useCreateChallenge() {
  return useMutation({
    mutationFn: async (data: {
      category: string;
      type: string;
      title: string;
      description: string;
      points: number;
      songId: string;
      segment: number;
    }) => {
      return await apiRequest("POST", "/api/challenges", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

export function useDeleteChallenge() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/challenges/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

// User session hooks
export function useUserSession(sessionToken: string | null) {
  return useQuery<UserSession>({
    queryKey: ["/api/sessions", sessionToken],
    enabled: !!sessionToken,
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/sessions", {});
    },
  });
}

export function useCompleteChallenge() {
  return useMutation({
    mutationFn: async ({ sessionToken, challengeId }: { sessionToken: string; challengeId: string }) => {
      return await apiRequest("POST", `/api/sessions/${sessionToken}/complete-challenge`, {
        challengeId,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", variables.sessionToken] });
    },
  });
}

// Song recognition hook
export function useRecognizeSong() {
  return useMutation({
    mutationFn: async (audioBlob: Blob) => {
      console.log('[Recognition] Starting recognition...');
      console.log('[Recognition] Blob size:', audioBlob.size, 'bytes');
      console.log('[Recognition] Blob type:', audioBlob.type);
      
      const formData = new FormData();
      // Convert blob to file with proper extension
      const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type });
      formData.append("audioFile", audioFile);
      
      console.log('[Recognition] Sending request to /api/recognize...');

      const response = await fetch("/api/recognize", {
        method: "POST",
        body: formData,
      });
      
      console.log('[Recognition] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Recognition] Error response:', errorText);
        throw new Error("Failed to recognize song");
      }

      const result = await response.json();
      console.log('[Recognition] Success:', result);
      return result as Promise<{
        song: Song;
        challenges: Challenge[];
        segment: number;
        confidence: number;
      }>;
    },
  });
}

// Admin stats hook
export function useAdminStats() {
  return useQuery<{
    totalSongs: number;
    totalChallenges: number;
    totalUsers: number;
    totalPoints: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });
}
