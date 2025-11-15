import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeCard } from "@/components/ChallengeCard";
import { TimelineSegment } from "@/components/TimelineSegment";
import { SocialShareModal } from "@/components/SocialShareModal";
import { ChallengeCompletionModal } from "@/components/ChallengeCompletionModal";
import { AnswerInputDialog } from "@/components/AnswerInputDialog";
import { PointsDisplay } from "@/components/PointsDisplay";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Music2, Clock, ExternalLink } from "lucide-react";
import { type Challenge, type Song, type ChallengeCategory, type ChallengeType, challengeCategories, challengeTypes, categoryDisplayNames } from "@shared/schema";

interface SongChallengesProps {
  song: Song;
  challenges: Challenge[];
  detectedSegment: number | null;
  completedChallengeIds: string[];
  totalPoints: number;
  lockedChallengeType: string | null | undefined; // Server-provided locked type
  sessionToken: string;
  onAcceptChallenge: (challengeId: string) => void;
  onBack: () => void;
}

export function SongChallenges({ 
  song, 
  challenges,
  detectedSegment,
  completedChallengeIds, 
  totalPoints,
  lockedChallengeType,
  sessionToken,
  onAcceptChallenge,
  onBack 
}: SongChallengesProps) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(detectedSegment);
  const [selectedType, setSelectedType] = useState<ChallengeType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareChallenge, setShareChallenge] = useState<Challenge | null>(null);
  const [sharePoints, setSharePoints] = useState(0);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [completedChallenge, setCompletedChallenge] = useState<Challenge | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [answerChallenge, setAnswerChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [shareMediaId, setShareMediaId] = useState<string | undefined>(undefined);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [showSkipOption, setShowSkipOption] = useState(false);

  // Reset category selection when type changes to prevent empty filter results
  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedType]);

  // Group challenges by segment
  const challengesBySegment = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.segment]) {
      acc[challenge.segment] = [];
    }
    acc[challenge.segment].push(challenge);
    return acc;
  }, {} as Record<number, Challenge[]>);

  // Filter challenges by selected segment, type, and category
  const allFilteredChallenges = challenges.filter(challenge => {
    const segmentMatch = selectedSegment === null || challenge.segment === selectedSegment;
    const typeMatch = selectedType === null || challenge.type === selectedType;
    const categoryMatch = selectedCategory === null || challenge.category === selectedCategory;
    return segmentMatch && typeMatch && categoryMatch;
  });

  // ROTATION LOGIC: Show only 1 challenge, rotate based on timestamp
  // This ensures different users see different challenges
  const rotationIndex = Math.floor(Date.now() / 60000) % Math.max(1, allFilteredChallenges.length);
  const filteredChallenges = allFilteredChallenges.length > 0 
    ? [allFilteredChallenges[rotationIndex]]
    : [];

  const handleAccept = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      // Apply point reduction if this is a retry after rejection
      const adjustedChallenge = rejectionCount > 0 
        ? { ...challenge, points: Math.max(5, challenge.points - (rejectionCount * 10)) }
        : challenge;
      
      setAnswerChallenge(adjustedChallenge);
      setAnswerDialogOpen(true);
    }
  };

  const handleRejectChallenge = () => {
    setRejectionCount(prev => prev + 1);
    
    // After 2 rejections, show skip option
    if (rejectionCount >= 1) {
      setShowSkipOption(true);
    }
    
    // Reset selections to allow new choice
    setSelectedType(null);
    setSelectedCategory(null);
  };

  const handleAnswerSubmit = (answer: string, mediaId?: string) => {
    setUserAnswer(answer);
    setShareMediaId(mediaId);
    setAnswerDialogOpen(false);
    
    // Open share modal immediately with the answer
    if (answerChallenge) {
      setShareChallenge(answerChallenge);
      setSharePoints(answerChallenge.points);
      setShareModalOpen(true);
      
      // Store for completion after share
      setCompletedChallenge(answerChallenge);
    }
  };

  const handleShareComplete = () => {
    // After sharing, complete the challenge
    if (completedChallenge) {
      onAcceptChallenge(completedChallenge.id);
      setShareModalOpen(false);
      setCompletionModalOpen(true);
      setRejectionCount(0); // Reset for next challenge
      setShowSkipOption(false);
    }
  };

  const handleSkipAndShareSong = () => {
    // Skip challenge but share about the song
    setShareChallenge(null);
    setUserAnswer(`Just discovered this amazing song: ${song.title} by ${song.artist}!`);
    setSharePoints(5); // Minimal points for just sharing the song
    setShareModalOpen(true);
  };

  const handleShare = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
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
            <div className="flex items-start gap-4 flex-wrap">
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
                <CardTitle className="text-3xl font-display mb-1" data-testid="text-song-title">
                  {song.title}
                </CardTitle>
                <CardDescription className="text-xl font-semibold mt-2" data-testid="text-song-artist">
                  {song.artist}
                </CardDescription>
                {song.album && (
                  <p className="text-base text-muted-foreground mt-2" data-testid="text-song-album">
                    <span className="font-medium">Album:</span> {song.album}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-song-duration">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                  {song.spotifyLink && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      asChild
                      data-testid="button-spotify-link"
                    >
                      <a href={song.spotifyLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Listen on Spotify
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Timeline */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Song Timeline</CardTitle>
            <CardDescription>
              {detectedSegment 
                ? `You scanned Minute ${detectedSegment} - challenges below are for this segment`
                : "Select a minute segment to view challenges"
              }
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
                  onClick={() => {
                    if (!detectedSegment || segment === detectedSegment) {
                      setSelectedSegment(selectedSegment === segment ? null : segment);
                    }
                  }}
                  isDetected={segment === detectedSegment}
                  isDisabled={detectedSegment !== null && segment !== detectedSegment}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type filters - Select challenge type first */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Step 1: Select Challenge Type</CardTitle>
            <CardDescription>
              {lockedChallengeType 
                ? `You've completed a ${lockedChallengeType} challenge. Scan again to try other types.`
                : "Choose the type of challenge you want to complete (one type per scan)"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {challengeTypes.map(type => {
                const isServerLocked = lockedChallengeType !== null && lockedChallengeType !== undefined && lockedChallengeType !== type;
                const isSelected = selectedType === type;
                const isDisabled = (selectedType !== null && selectedType !== type) || isServerLocked;
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => !isDisabled && setSelectedType(type)}
                    disabled={isDisabled}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    data-testid={`filter-type-${type}`}
                  >
                    <Badge variant={isSelected ? "secondary" : "outline"} className="text-sm font-bold">
                      {type}
                    </Badge>
                    <span className="text-xs text-muted-foreground text-center">
                      {type === "ACTION" && "Take action on an issue"}
                      {type === "SHARE" && "Share on social media"}
                      {type === "KNOW" && "Test your knowledge"}
                      {type === "ALTERNATIVE" && "Create content"}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category filters - Select category second (only after type is selected) */}
        {selectedType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Step 2: Select Issue Category</CardTitle>
              <CardDescription>
                Choose the social justice issue you want to address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {challengeCategories.map(category => {
                  const isSelected = selectedCategory === category;
                  const isDisabled = selectedCategory !== null && selectedCategory !== category;
                  return (
                    <Button
                      key={category}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => !isDisabled && setSelectedCategory(category)}
                      disabled={isDisabled}
                      className="gap-2"
                      data-testid={`filter-category-${category}`}
                    >
                      <CategoryBadge category={category} className="mr-0" />
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip Option - Appears after 2 rejections */}
        {showSkipOption && !selectedType && (
          <Card className="border-2 border-primary/30">
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-lg font-semibold">Skip Challenge</p>
              <p className="text-muted-foreground">
                Not interested in challenges? You can skip and just share about the song "{song.title}" instead.
              </p>
              <Button 
                onClick={handleSkipAndShareSong}
                variant="outline"
                size="lg"
                data-testid="button-skip-and-share-song"
              >
                Skip Challenge and Post About "{song.title}"
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Challenges grid - Show single challenge after both type and category are selected */}
        <div>
          {!selectedType && !showSkipOption && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg font-semibold mb-2">Choose a Challenge Type</p>
                <p className="text-muted-foreground">
                  Select ACTION, SHARE, KNOW, or ALTERNATIVE above to get started
                </p>
              </CardContent>
            </Card>
          )}

          {selectedType && !selectedCategory && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg font-semibold mb-2">Choose an Issue Category</p>
                <p className="text-muted-foreground">
                  Select a social justice issue above to see your challenge
                </p>
              </CardContent>
            </Card>
          )}

          {selectedType && selectedCategory && (
            <>
              <h2 className="text-2xl font-bold mb-4">
                Your {selectedType} Challenge
                <span className="text-muted-foreground"> - {categoryDisplayNames[selectedCategory]}</span>
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
                <div className="grid gap-6 md:grid-cols-1" data-testid="grid-challenges">
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
            </>
          )}
        </div>
      </div>

      {/* Answer input dialog */}
      <AnswerInputDialog
        open={answerDialogOpen}
        onOpenChange={setAnswerDialogOpen}
        challenge={answerChallenge}
        onSubmit={handleAnswerSubmit}
        onReject={handleRejectChallenge}
        songTitle={song.title}
        sessionToken={sessionToken}
      />

      {/* Completion modal */}
      <ChallengeCompletionModal
        open={completionModalOpen}
        onOpenChange={setCompletionModalOpen}
        challenge={completedChallenge}
        pointsEarned={completedChallenge?.points || 0}
      />

      {/* Share modal */}
      <SocialShareModal
        open={shareModalOpen}
        onOpenChange={(open) => {
          setShareModalOpen(open);
          if (!open && completedChallenge) {
            // When share modal closes and we have a completed challenge, trigger completion
            handleShareComplete();
          }
        }}
        challenge={shareChallenge}
        points={sharePoints}
        userAnswer={userAnswer}
        songTitle={song.title}
        songArtist={song.artist}
        mediaId={shareMediaId}
        sessionToken={sessionToken}
      />
    </div>
  );
}
