import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./CategoryBadge";
import { ChallengeBadge } from "./ChallengeBadge";
import { PointsDisplay } from "./PointsDisplay";
import { type Challenge, type ChallengeCategory, type ChallengeType } from "@shared/schema";
import { CheckCircle2, Share2, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted?: boolean;
  isActive?: boolean;
  onAccept?: (challengeId: string) => void;
  onShare?: (challengeId: string) => void;
  className?: string;
}

export function ChallengeCard({ 
  challenge, 
  isCompleted = false, 
  isActive = false,
  onAccept,
  onShare,
  className = "" 
}: ChallengeCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Copy challenge text to clipboard
  const handleCopy = async () => {
    const challengeText = `${challenge.title}\n\n${challenge.description}`;
    try {
      await navigator.clipboard.writeText(challengeText);
      setCopied(true);
      toast({
        title: "✓ Copied to clipboard!",
        description: "Challenge text is ready to share",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Share challenge - uses existing onShare handler if provided, otherwise native share
  const handleShare = async () => {
    // If parent provides onShare handler, use it (opens SocialShareModal)
    if (onShare) {
      onShare(challenge.id);
      return;
    }

    // Otherwise, use native share as standalone feature
    const challengeText = `${challenge.title}\n\n${challenge.description}\n\nJoin American Split AI ARG at https://agenteddiesing.replit.app`;
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'American Split AI Challenge',
          text: challengeText,
          url: 'https://agenteddiesing.replit.app',
        });
        toast({
          title: "✓ Shared!",
          description: "Thanks for spreading the word",
        });
      } catch (err) {
        // User cancelled share, ignore error
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard with instructions
      try {
        await navigator.clipboard.writeText(challengeText);
        toast({
          title: "✓ Copied to clipboard!",
          description: "Paste this challenge into Facebook, Instagram, or any social media platform!",
          duration: 5000,
        });
      } catch (err) {
        console.error('Copy failed:', err);
        toast({
          title: "Unable to share",
          description: "Please try copying the challenge text instead",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl ${
        isActive ? "ring-2 ring-primary shadow-lg" : ""
      } ${isCompleted ? "opacity-60" : ""} ${className} hover-elevate`}
      data-testid={`card-challenge-${challenge.id}`}
    >
      {isCompleted && (
        <div className="absolute top-4 right-4 z-10">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
      )}
      
      <CardHeader className="space-y-4 pb-5">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CategoryBadge category={challenge.category as ChallengeCategory} />
          <ChallengeBadge type={challenge.type as ChallengeType} />
        </div>
        <CardTitle className="text-2xl font-bold leading-tight tracking-tight">
          {challenge.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <CardDescription className="text-lg text-foreground/90 leading-relaxed font-medium">
          {challenge.description}
        </CardDescription>
        
        {challenge.organization && (
          <div className="flex items-start gap-2 p-4 rounded-xl bg-primary/10 border border-primary/30 shadow-sm">
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground mb-1">Related Organization:</p>
              <p className="text-sm text-foreground/80 font-medium">{challenge.organization}</p>
              {challenge.organizationUrl && (
                <a 
                  href={challenge.organizationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2 font-semibold"
                  data-testid={`link-organization-${challenge.id}`}
                >
                  Learn More <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-5 border-t">
        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          <PointsDisplay points={challenge.points} size="md" />
          
          <div className="flex gap-2 flex-wrap">
            {onAccept && !isCompleted && (
              <Button
                size="default"
                onClick={() => onAccept(challenge.id)}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                data-testid={`button-accept-${challenge.id}`}
              >
                Accept Challenge
              </Button>
            )}
          </div>
        </div>

        {/* Copy and Share buttons row */}
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="default"
            onClick={handleCopy}
            className="flex-1 font-semibold"
            data-testid={`button-copy-${challenge.id}`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Challenge
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="default"
            onClick={handleShare}
            className="flex-1 font-semibold"
            data-testid={`button-share-challenge-${challenge.id}`}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Challenge
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
