import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserScanner } from "@/pages/UserScanner";
import { SongChallenges } from "@/pages/SongChallenges";
import { Leaderboard } from "@/pages/Leaderboard";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { SongsManager } from "@/pages/admin/SongsManager";
import { ChallengesManager } from "@/pages/admin/ChallengesManager";
import { useState, useEffect } from "react";
import { 
  useCreateSession, 
  useUserSession, 
  useCompleteChallenge, 
  useRecognizeSong,
  useSongs,
  useChallenges,
  useCreateSong,
  useDeleteSong,
  useCreateChallenge,
  useDeleteChallenge,
  useAdminStats,
  useSongChallenges,
} from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import { type Song, type Challenge } from "@shared/schema";
import NotFound from "@/pages/not-found";

function UserRoutes() {
  const [currentView, setCurrentView] = useState<"scanner" | "challenges" | "leaderboard" | "admin-login">("scanner");
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem("sessionToken");
  });
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentChallenges, setCurrentChallenges] = useState<Challenge[]>([]);

  const { toast } = useToast();
  const createSession = useCreateSession();
  const { data: session } = useUserSession(sessionToken);
  const completeChallenge = useCompleteChallenge();
  const recognizeSong = useRecognizeSong();

  useEffect(() => {
    if (!sessionToken) {
      createSession.mutate(undefined, {
        onSuccess: async (response) => {
          const newSession = await response.json();
          setSessionToken(newSession.sessionToken);
          localStorage.setItem("sessionToken", newSession.sessionToken);
        },
      });
    }
  }, [sessionToken]);

  const handleSongDetected = (song: Song, challenges: Challenge[]) => {
    setCurrentSong(song);
    setCurrentChallenges(challenges);
    setCurrentView("challenges");
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    if (!sessionToken) return;

    try {
      await completeChallenge.mutateAsync({ sessionToken, challengeId });
      toast({
        title: "Challenge completed!",
        description: `You've earned points for completing this challenge.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete challenge",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentView("scanner");
    setCurrentSong(null);
    setCurrentChallenges([]);
  };

  const handleRecognize = async (audioBlob: Blob) => {
    try {
      const result = await recognizeSong.mutateAsync(audioBlob);
      handleSongDetected(result.song, result.challenges);
      
      const segmentText = result.segment === 1 ? "first minute" : 
                         result.segment === 2 ? "second minute" : 
                         result.segment === 3 ? "third minute" : 
                         "minute 4+";
      
      toast({
        title: "Song recognized!",
        description: `Found: ${result.song.title} - ${segmentText}`,
      });
    } catch (error) {
      toast({
        title: "Recognition failed",
        description: "Could not identify the song. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (currentView === "admin-login") {
    return (
      <AdminLogin
        onLogin={(password) => {
          if (password === "admin123") {
            localStorage.setItem("adminAuth", "true");
            window.location.href = "/admin";
          } else {
            toast({
              title: "Access Denied",
              description: "Incorrect password",
              variant: "destructive",
            });
          }
        }}
        onBack={() => setCurrentView("scanner")}
      />
    );
  }

  if (currentView === "leaderboard") {
    return (
      <Leaderboard
        currentSessionToken={sessionToken}
        onBack={() => setCurrentView("scanner")}
      />
    );
  }

  if (currentView === "scanner") {
    return (
      <UserScanner 
        onSongDetected={handleRecognize}
        totalPoints={session?.totalPoints || 0}
        isRecognizing={recognizeSong.isPending}
        onViewLeaderboard={() => setCurrentView("leaderboard")}
        onAdminLogin={() => setCurrentView("admin-login")}
      />
    );
  }

  if (!currentSong) {
    return <div>Loading...</div>;
  }

  return (
    <SongChallenges
      song={currentSong}
      challenges={currentChallenges}
      completedChallengeIds={(session?.completedChallenges as string[]) || []}
      totalPoints={session?.totalPoints || 0}
      onAcceptChallenge={handleAcceptChallenge}
      onBack={handleBack}
    />
  );
}

function AdminRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("adminAuth") === "true";
  });
  const { toast } = useToast();
  const { data: songs = [], isLoading: songsLoading } = useSongs();
  const { data: challenges = [], isLoading: challengesLoading } = useChallenges();
  const { data: stats } = useAdminStats();
  const createSong = useCreateSong();
  const deleteSong = useDeleteSong();
  const createChallenge = useCreateChallenge();
  const deleteChallenge = useDeleteChallenge();

  const handleLogin = (password: string) => {
    if (password === "admin123") {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        onBack={() => window.location.href = "/"}
      />
    );
  }

  const handleCreateSong = async (data: { title: string; artist: string; duration: number; audioFile: File }) => {
    try {
      await createSong.mutateAsync(data);
      toast({
        title: "Success",
        description: "Song uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload song",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      await deleteSong.mutateAsync(songId);
      toast({
        title: "Success",
        description: "Song deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete song",
        variant: "destructive",
      });
    }
  };

  const handleCreateChallenge = async (data: any) => {
    try {
      await createChallenge.mutateAsync(data);
      toast({
        title: "Success",
        description: "Challenge created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      await deleteChallenge.mutateAsync(challengeId);
      toast({
        title: "Success",
        description: "Challenge deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete challenge",
        variant: "destructive",
      });
    }
  };

  const defaultStats = {
    totalSongs: songs.length,
    totalChallenges: challenges.length,
    totalUsers: 0,
    totalPoints: 0,
  };

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin">
          <AdminDashboard stats={stats || defaultStats} />
        </Route>
        <Route path="/admin/songs">
          {songsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <SongsManager
              songs={songs}
              onCreateSong={handleCreateSong}
              onDeleteSong={handleDeleteSong}
            />
          )}
        </Route>
        <Route path="/admin/challenges">
          {challengesLoading || songsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ChallengesManager
              challenges={challenges}
              songs={songs}
              onCreateChallenge={handleCreateChallenge}
              onDeleteChallenge={handleDeleteChallenge}
            />
          )}
        </Route>
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={UserRoutes} />
      <Route path="/admin" nest component={AdminRoutes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
