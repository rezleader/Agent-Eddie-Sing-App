import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeCard } from "@/components/ChallengeCard";
import { TimelineSegment } from "@/components/TimelineSegment";
import { SocialShareModal } from "@/components/SocialShareModal";
import { PointsDisplay } from "@/components/PointsDisplay";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ArrowLeft, Music2, Clock } from "lucide-react";
import { type Challenge, type Song, type ChallengeCategory, challengeCategories, categoryDisplayNames } from "@shared/schema";

interface SongChallengesProps {
  song: Song;
  challenges: Challenge[];
  completedChallengeIds: string[];
  totalPoints: number;
  onAcceptChallenge: (challengeId: string) => void;
  onBack: () => void;
}

export function SongChallenges({ 
  song, 
  challenges, 
  completedChallengeIds, 
  totalPoints,
  onAcceptChallenge,
  onBack 
}: SongChallengesProps) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | "all">("all");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareChallenge, setShareChallenge] = useState<Challenge | null>(null);
  const [sharePoints, setSharePoints] = useState(0);

  // Group challenges by segment
  const challengesBySegment = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.segment]) {
      acc[challenge.segment] = [];
    }
    acc[challenge.segment].push(challenge);
    return acc;
  }, {} as Record<number, Challenge[]>);

  // Filter challenges by selected segment and category
  const filteredChallenges = challenges.filter(challenge => {
    const segmentMatch = selectedSegment === null || challenge.segment === selectedSegment;
    const categoryMatch = selectedCategory === "all" || challenge.category === selectedCategory;
    return segmentMatch && categoryMatch;
  });

  const handleShare = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setShareChallenge(challenge);
      setSharePoints(challenge.points);
      setShareModalOpen(true);
    }
  };

  const handleAccept = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      onAcceptChallenge(challengeId);
      // Auto-open share modal after accepting
      setShareChallenge(challenge);
      setSharePoints(challenge.points);
      setShareModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <Button 
            variant="ghost" 
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scanner
          </Button>
          <PointsDisplay points={totalPoints} size="lg" />
        </div>

        {/* Song info */}
        <Card className="shadow-lg border-2" data-testid="card-song-info">
          <CardHeader>
            <div className="flex items-start gap-4">
              {song.albumArt ? (
                <img 
                  src={song.albumArt} 
                  alt={song.title}
                  className="w-24 h-24 rounded-lg object-cover shadow-md"
                  data-testid="img-album-art"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center" data-testid="img-album-placeholder">
                  <Music2 className="w-12 h-12 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-3xl font-display" data-testid="text-song-title">
                  {song.title}
                </CardTitle>
                <CardDescription className="text-lg mt-1" data-testid="text-song-artist">
                  {song.artist}
                </CardDescription>
                {song.album && (
                  <p className="text-base text-muted-foreground mt-1" data-testid="text-song-album">
                    Album: {song.album}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground" data-testid="text-song-duration">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Song Timeline</CardTitle>
            <CardDescription>
              Click a segment to view its challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="timeline-segments">
              {[1, 2, 3, 4].map(segment => (
                <TimelineSegment
                  key={segment}
                  segment={segment}
                  isActive={selectedSegment === segment}
                  hasChallenges={(challengesBySegment[segment]?.length || 0) > 0}
                  onClick={() => setSelectedSegment(selectedSegment === segment ? null : segment)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Filter by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                data-testid="filter-category-all"
              >
                All Categories
              </Button>
              {challengeCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="gap-2"
                  data-testid={`filter-category-${category}`}
                >
                  <CategoryBadge category={category} className="mr-0" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Challenges grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedSegment ? `Minute ${selectedSegment} Challenges` : "All Challenges"}
            {selectedCategory !== "all" && (
              <span className="text-muted-foreground"> - {categoryDisplayNames[selectedCategory]}</span>
            )}
          </h2>
          
          {filteredChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground" data-testid="text-no-challenges">
                  No challenges found for the selected filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2" data-testid="grid-challenges">
              {filteredChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isCompleted={completedChallengeIds.includes(challenge.id)}
                  isActive={selectedSegment === challenge.segment}
                  onAccept={handleAccept}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share modal */}
      <SocialShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        challenge={shareChallenge}
        points={sharePoints}
      />
    </div>
  );
}
