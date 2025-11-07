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
    mutationFn: async (data: { title: string; artist: string; duration: number; audioFile: File }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("artist", data.artist);
      formData.append("duration", data.duration.toString());
      formData.append("audioFile", data.audioFile);

      const response = await fetch("/api/songs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create song");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

export function useUpdateSong() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; artist: string; album?: string; duration: number } }) => {
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
      const formData = new FormData();
      // Convert blob to file with proper extension
      const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type });
      formData.append("audioFile", audioFile);

      const response = await fetch("/api/recognize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to recognize song");
      }

      return response.json() as Promise<{
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
