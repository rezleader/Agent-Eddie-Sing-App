import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LeaderboardEntry {
  rank: number;
  playerId: string;
  totalPoints: number;
  completedChallenges: number;
  isCurrentUser: boolean;
}

interface LeaderboardProps {
  currentSessionToken?: string | null;
  onBack?: () => void;
}

export function Leaderboard({ currentSessionToken, onBack }: LeaderboardProps) {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard", currentSessionToken],
    queryFn: async () => {
      const url = currentSessionToken 
        ? `/api/leaderboard?sessionToken=${encodeURIComponent(currentSessionToken)}`
        : "/api/leaderboard";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" data-testid="icon-rank-1" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" data-testid="icon-rank-2" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-700" data-testid="icon-rank-3" />;
      default:
        return <span className="w-5 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-primary">
              Leaderboard
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Top players in the American Split AI ARG
            </p>
          </div>
          {onBack && (
            <Button variant="ghost" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        {/* Leaderboard card */}
        <Card className="shadow-xl border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Top Players
            </CardTitle>
            <CardDescription>
              Rankings based on total points earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12" data-testid="loading-leaderboard">
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-leaderboard">
                <p className="text-muted-foreground">No players yet. Be the first to earn points!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-testid="table-leaderboard">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Player ID</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Challenges</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry) => {
                      return (
                        <TableRow 
                          key={entry.playerId}
                          className={entry.isCurrentUser ? "bg-primary/10 font-semibold" : ""}
                          data-testid={`row-player-${entry.playerId}`}
                        >
                          <TableCell className="text-center" data-testid={`rank-${entry.rank}`}>
                            {getRankIcon(entry.rank)}
                          </TableCell>
                          <TableCell data-testid={`player-id-${entry.playerId}`}>
                            {entry.isCurrentUser ? "You" : `Player ${entry.playerId}`}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary" data-testid={`points-${entry.playerId}`}>
                            {entry.totalPoints}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground" data-testid={`challenges-${entry.playerId}`}>
                            {entry.completedChallenges}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg">How to Climb the Leaderboard:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Recognize songs using the microphone scanner</li>
                <li>Complete challenges from all five categories</li>
                <li>Higher difficulty challenges earn more points</li>
                <li>Share your achievements on social media for bonus visibility</li>
                <li>Take action on social justice issues to make a real impact!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
